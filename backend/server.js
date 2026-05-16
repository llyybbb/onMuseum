import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { Redis } from '@upstash/redis'
import pLimit from 'p-limit'
import Anthropic from '@anthropic-ai/sdk'

const app = express()

const allowedOrigins = new Set(
  [
    process.env.FRONTEND_ORIGIN ?? '',
    ...(process.env.CORS_ORIGINS ?? '').split(','),
  ]
    .map((origin) => origin.trim())
    .filter(Boolean),
)

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true)
      if (allowedOrigins.has(origin)) return callback(null, true)
      return callback(new Error('Not allowed by CORS'))
    },
  }),
)
app.use(express.json({ limit: '1mb' }))

const PORT = process.env.PORT || 3000
const MET_BASE = 'https://collectionapi.metmuseum.org/public/collection/v1'
const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-opus-4-6'
const CLAUDE_MAX_TOKENS = Number(process.env.CLAUDE_MAX_TOKENS ?? 20000)
const CLAUDE_TEMPERATURE = Number(process.env.CLAUDE_TEMPERATURE ?? 1)
const CLAUDE_OUTPUT_EFFORT = process.env.CLAUDE_OUTPUT_EFFORT || 'high'
const DEFAULT_CLAUDE_SYSTEM_PROMPT =
  '너는 이제부터 전시관 도슨트야. 내가 제공하는 이미지 url과 작품 제목, 작가 이름 등을 제공하면 이 작품에 대한 정보와 이야기를 도슨트가 설명하는 것 처럼 설명해줘. 작가 이름이나 작품 제목은 미상인 경우 Unknown으로 줄게.'
const ANTHROPIC_API_KEY =
  process.env.ANTHROPIC_API_KEY ?? process.env.CLAUDE_API_KEY ?? ''

const anthropic = ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: ANTHROPIC_API_KEY })
  : null

// Upstash Redis (REST)
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

const IDS_TTL_SEC = 60 * 60 * 24 * 7
const OBJ_TTL_SEC = 60 * 60 * 24 * 30
const DEPTS_TTL_SEC = 60 * 60 * 24 * 7
const departmentsKey = () => `met:departments`
const searchIdsKey = (paramsString) => `met:search:ids:${paramsString}`

const MAX_SIZE = 30
const CONCURRENCY = 8
const limit = pLimit(CONCURRENCY)
const NO_IMAGE_SENTINEL = '__NO_IMAGE__'

const deptIdsKey = (deptId) => `met:dept:ids:${deptId}`
const objKey = (id) => `met:obj:${id}`

function pick(obj) {
  return {
    objectID: obj.objectID,
    title: obj.title,
    primaryImage: obj.primaryImage,
    primaryImageSmall: obj.primaryImageSmall,
    artistDisplayName: obj.artistDisplayName,
    artistDisplayBio: obj.artistDisplayBio,
    artistRole: obj.artistRole,
    period: obj.period,
    dimensions: obj.dimensions,
    classification: obj.classification,
    medium: obj.medium,
    department: obj.department,
  }
}

function safeParse(v) {
  if (v == null) return { ok: false, value: null }
  if (typeof v !== 'string') return { ok: true, value: v }
  try {
    return { ok: true, value: JSON.parse(v) }
  } catch {
    return { ok: false, value: null }
  }
}

function toFilledText(v, fallback = 'Unknown') {
  const text = String(v ?? '').trim()
  return text || fallback
}

function buildClaudeUserPrompt(artwork) {
  const lines = [
    `Image URL: ${toFilledText(artwork.imageUrl)}`,
    `Title: ${toFilledText(artwork.title)}`,
    `Artist: ${toFilledText(artwork.artist)}`,
  ]

  return lines.join('\n')
}

function extractClaudeText(contentBlocks) {
  if (!Array.isArray(contentBlocks)) return ''

  return contentBlocks
    .filter((block) => block?.type === 'text' && typeof block.text === 'string')
    .map((block) => block.text.trim())
    .filter(Boolean)
    .join('\n\n')
}

async function getDepartmentObjectIDs(deptId) {
  const key = deptIdsKey(deptId)

  const cached = await redis.get(key)
  const parsed = safeParse(cached)
  if (parsed.ok) return parsed.value

  if (cached != null) await redis.del(key)

  const r = await fetch(`${MET_BASE}/objects?departmentIds=${deptId}`)
  if (!r.ok) throw new Error(`Met objects list failed: ${r.status}`)

  const json = await r.json()
  const ids = Array.isArray(json.objectIDs) ? json.objectIDs : []

  await redis.set(key, JSON.stringify(ids), { ex: IDS_TTL_SEC })
  return ids
}

async function getSearchObjectIDs(q) {
  const keyword = String(q ?? '').trim()
  if (!keyword) return []

  const params = new URLSearchParams()
  params.set('q', keyword)
  params.set('hasImages', 'true')

  const key = searchIdsKey(params.toString())

  const cached = await redis.get(key)
  const parsed = safeParse(cached)
  if (parsed.ok) return parsed.value

  if (cached != null) await redis.del(key)

  const r = await fetch(`${MET_BASE}/search?${params.toString()}`)
  if (!r.ok) throw new Error(`Met search failed: ${r.status}`)

  const json = await r.json()
  const ids = Array.isArray(json.objectIDs) ? json.objectIDs : []

  await redis.set(key, JSON.stringify(ids), { ex: IDS_TTL_SEC })
  return ids
}

async function fetchAndCacheObject(id) {
  const key = objKey(id)

  const cached = await redis.get(key)
  const parsed = safeParse(cached)
  if (parsed.ok) {
    if (parsed.value === NO_IMAGE_SENTINEL) return null
    return parsed.value
  }

  if (cached != null) await redis.del(key)

  const r = await fetch(`${MET_BASE}/objects/${id}`)
  if (!r.ok) return null

  const obj = await r.json()
  const picked = pick(obj)

  if (!picked.primaryImageSmall) {
    await redis.set(key, JSON.stringify(NO_IMAGE_SENTINEL), { ex: OBJ_TTL_SEC })
    return null
  }

  await redis.set(key, JSON.stringify(picked), { ex: OBJ_TTL_SEC })
  return picked
}

app.get('/api/departments', async (req, res) => {
  try {
    const key = departmentsKey()

    const cached = await redis.get(key)
    const parsed = safeParse(cached)
    if (parsed.ok) return res.json(parsed.value)

    if (cached != null) await redis.del(key)

    const r = await fetch(`${MET_BASE}/departments`)
    if (!r.ok) throw new Error(`Met departments failed: ${r.status}`)

    const json = await r.json()
    await redis.set(key, JSON.stringify(json), { ex: DEPTS_TTL_SEC })

    return res.json(json)
  } catch (e) {
    return res.status(500).json({ message: e?.message ?? 'departments failed' })
  }
})

app.get('/api/hall/search', async (req, res) => {
  const q = String(req.query.q ?? '').trim()
  if (!q) {
    return res.status(400).json({ message: 'q is required' })
  }

  const cursor = Math.max(0, Number(req.query.cursor ?? 0))
  const size = Math.min(MAX_SIZE, Math.max(1, Number(req.query.size ?? 20)))

  try {
    const ids = await getSearchObjectIDs(q)
    const total = ids.length

    let i = cursor
    const items = []

    const MAX_SCAN = Math.max(size * 50, 1000)
    const BATCH_SIZE = CONCURRENCY * 2
    let scanned = 0

    while (i < total && items.length < size && scanned < MAX_SCAN) {
      const from = i
      const to = Math.min(i + BATCH_SIZE, total)
      const batchIds = ids.slice(from, to)

      const batch = await Promise.all(
        batchIds.map((id) => limit(() => fetchAndCacheObject(id))),
      )

      for (const obj of batch) {
        if (obj) items.push(obj)
        if (items.length >= size) break
      }

      i = to
      scanned += batchIds.length
    }

    return res.json({
      meta: {
        q,
        cursor,
        nextCursor: i,
        size,
        total,
        returned: items.length,
        exhausted: i >= total,
      },
      items,
    })
  } catch (e) {
    return res
      .status(500)
      .json({ message: e?.message ?? 'search fetch failed' })
  }
})

app.get('/api/hall/:departmentId', async (req, res) => {
  const departmentId = Number(req.params.departmentId)
  if (!Number.isFinite(departmentId)) {
    return res.status(400).json({ message: 'invalid departmentId' })
  }

  const cursor = Math.max(0, Number(req.query.cursor ?? 0))
  const size = Math.min(MAX_SIZE, Math.max(1, Number(req.query.size ?? 20)))

  try {
    const ids = await getDepartmentObjectIDs(departmentId)
    const total = ids.length

    let i = cursor
    const items = []

    const MAX_SCAN = Math.max(size * 50, 1000)
    const BATCH_SIZE = CONCURRENCY * 2
    let scanned = 0

    while (i < total && items.length < size && scanned < MAX_SCAN) {
      const from = i
      const to = Math.min(i + BATCH_SIZE, total)
      const batchIds = ids.slice(from, to)

      const batch = await Promise.all(
        batchIds.map((id) => limit(() => fetchAndCacheObject(id))),
      )

      for (const obj of batch) {
        if (obj) items.push(obj)
        if (items.length >= size) break
      }

      i = to
      scanned += batchIds.length
    }

    return res.json({
      meta: {
        departmentId,
        cursor,
        nextCursor: i,
        size,
        total,
        returned: items.length,
        exhausted: i >= total,
      },
      items,
    })
  } catch (e) {
    return res.status(500).json({ message: e?.message ?? 'hall fetch failed' })
  }
})

app.post('/api/claude/explain', async (req, res) => {
  if (!anthropic) {
    return res.status(500).json({
      message: 'ANTHROPIC_API_KEY (or CLAUDE_API_KEY) is not configured',
    })
  }

  const artwork = req.body ?? {}
  const hasAnyArtworkField = [artwork.imageUrl, artwork.title, artwork.artist]
    .map((v) => String(v ?? '').trim())
    .some(Boolean)

  if (!hasAnyArtworkField) {
    return res
      .status(400)
      .json({ message: 'At least one of imageUrl, title, artist is required.' })
  }

  try {
    const message = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: CLAUDE_MAX_TOKENS,
      temperature: CLAUDE_TEMPERATURE,
      system:
        String(process.env.CLAUDE_SYSTEM_PROMPT ?? '').trim() ||
        DEFAULT_CLAUDE_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: buildClaudeUserPrompt(artwork),
            },
          ],
        },
      ],
      thinking: {
        type: 'disabled',
      },
      output_config: {
        effort: CLAUDE_OUTPUT_EFFORT,
      },
    })

    const text = extractClaudeText(message?.content)
    if (!text) {
      return res
        .status(502)
        .json({ message: 'Claude response did not include text content.' })
    }

    return res.json({
      text,
      model: message?.model ?? CLAUDE_MODEL,
    })
  } catch (e) {
    const status = Number(e?.status) || 500
    const detail =
      e?.error?.message ?? e?.message ?? 'Claude request failed unexpectedly.'

    return res
      .status(status)
      .json({ message: detail })
  }
})

app.get('/', (req, res) => res.send('server is running'))

if (process.env.NODE_ENV !== 'production') {
  app.get('/api/debug/flush', async (req, res) => {
    await redis.flushdb()
    res.json({ ok: true })
  })
}

app.listen(PORT, () => console.log(`backend on http://localhost:${PORT}`))
