import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { Redis } from '@upstash/redis'
import pLimit from 'p-limit'

const app = express()
app.use(cors())

const PORT = process.env.PORT || 5173
const MET_BASE = 'https://collectionapi.metmuseum.org/public/collection/v1'

// Upstash Redis (REST)
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

// 캐시 TTL
const IDS_TTL_SEC = 60 * 60 * 24 * 7 // 7일
const OBJ_TTL_SEC = 60 * 60 * 24 * 30 // 30일

// 요청 제한
const MAX_SIZE = 30
const CONCURRENCY = 8
const limit = pLimit(CONCURRENCY)

const deptIdsKey = (deptId) => `met:dept:ids:${deptId}`
const objKey = (id) => `met:obj:${id}`

function pick(obj) {
  return {
    objectID: obj.objectID,
    title: obj.title,
    primaryImageSmall: obj.primaryImageSmall,
    artistDisplayName: obj.artistDisplayName,
    artistBeginDate:obj.artistBeginDate,
    artistEndDate: obj.artistEndDate,
    objectDate: obj.objectDate,
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
  if (parsed.ok) return parsed.value

  // 깨진 캐시 제거
  if (cached != null) await redis.del(key)

  const r = await fetch(`${MET_BASE}/objects/${id}`)
  if (!r.ok) return null

  const obj = await r.json()
  const picked = pick(obj)

  await redis.set(key, JSON.stringify(picked), { ex: OBJ_TTL_SEC })
  return picked
}

/**
 * 페이지 단위 응답
 * GET /api/hall/:departmentId?page=1&size=20
 */
app.get('/api/hall/:departmentId', async (req, res) => {
  const departmentId = Number(req.params.departmentId)
  if (!Number.isFinite(departmentId)) {
    return res.status(400).json({ message: 'invalid departmentId' })
  }

  const page = Math.max(1, Number(req.query.page ?? 1))
  const size = Math.min(MAX_SIZE, Math.max(1, Number(req.query.size ?? 20)))

  try {
    const ids = await getDepartmentObjectIDs(departmentId)
    const total = ids.length

    const start = (page - 1) * size
    const end = Math.min(start + size, total)
    const pageIds = ids.slice(start, end)

    // mget도 안전 파싱
    const keys = pageIds.map((id) => objKey(id))
    const cachedArr = await redis.mget(keys)

    const items = new Array(pageIds.length).fill(null)
    const misses = []

    for (let i = 0; i < pageIds.length; i++) {
      const v = cachedArr[i]
      const parsed = safeParse(v)

      if (parsed.ok) {
        items[i] = parsed.value
      } else {
        // 깨진 캐시 제거 후 miss 처리
        if (v != null) await redis.del(keys[i])
        misses.push({ idx: i, id: pageIds[i] })
      }
    }

    const fetched = await Promise.all(
      misses.map(({ idx, id }) =>
        limit(async () => ({ idx, obj: await fetchAndCacheObject(id) })),
      ),
    )

    for (const { idx, obj } of fetched) items[idx] = obj

    return res.json({
      meta: { departmentId, page, size, total, start, end },
      items: items.filter(Boolean),
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
