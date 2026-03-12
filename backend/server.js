import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { Redis } from '@upstash/redis'
import pLimit from 'p-limit'

const app = express()
app.use(cors())

const PORT = process.env.PORT || 5174
const MET_BASE = 'https://collectionapi.metmuseum.org/public/collection/v1'

// Upstash Redis (REST)
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

// 캐시 TTL
const IDS_TTL_SEC = 60 * 60 * 24 * 7 
const OBJ_TTL_SEC = 60 * 60 * 24 * 30 
const DEPTS_TTL_SEC = 60 * 60 * 24 * 7
const departmentsKey = () => `met:departments`

// 요청 제한
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

// 안 터지는 파서
function safeParse(v) {
  if (v == null) return { ok: false, value: null }
  if (typeof v !== 'string') return { ok: true, value: v } // 이미 객체/배열이면 그대로
  try {
    return { ok: true, value: JSON.parse(v) }
  } catch {
    return { ok: false, value: null }
  }
}

async function getDepartmentObjectIDs(deptId) {
  const key = deptIdsKey(deptId)

  const cached = await redis.get(key)
  const parsed = safeParse(cached)
  if (parsed.ok) return parsed.value

  // 깨진 캐시 제거
  if (cached != null) await redis.del(key)

  const r = await fetch(`${MET_BASE}/objects?departmentIds=${deptId}`)
  if (!r.ok) throw new Error(`Met objects list failed: ${r.status}`)

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

  // 깨진 캐시 제거
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


/**
 * 페이지 단위 응답
 * GET /api/hall/:departmentId?cursor=0&size=15
 */

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

    // size개 채우기 위해 cursor부터 계속 진행
    let i = cursor
    const items = []

    // 최대 size*15개까지만 훑기
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
        nextCursor: i,          // 다음 요청 시작점
        size,
        total,
        returned: items.length,
        exhausted: i >= total,  // 더 이상 없음
      },
      items,
    })
  } catch (e) {
    return res.status(500).json({ message: e?.message ?? 'hall fetch failed' })
  }
})


// 테스트
app.get('/', (req, res) => res.send('서버 정상 작동중 🚀'))

// 개발용: 필요할 때만 켜고, 배포 전 삭제
app.get('/api/debug/flush', async (req, res) => {
  await redis.flushdb()
  res.json({ ok: true })
})

app.listen(PORT, () => console.log(`backend on http://localhost:${PORT}`))
