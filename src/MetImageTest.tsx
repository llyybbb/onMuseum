import { useQuery } from '@tanstack/react-query'

export default function MetImageTest() {
  // 🔹 검색어를 'van gogh'로 지정 (이미지 포함 & 공개 도메인만)
  const { data, isLoading, error } = useQuery({
    queryKey: ['metSearch'],
    queryFn: async () => {
      const res = await fetch(
        'https://collectionapi.metmuseum.org/public/collection/v1/search?artistOrCulture=true&hasImages=true&isPublicDomain=true&q=gogh'
      )
      const json = await res.json()

      // 검색 결과 중 첫 번째 작품 ID로 상세 조회
      const firstId = json.objectIDs?.[2]
      if (!firstId) throw new Error('검색 결과가 없습니다.')

      const detailRes = await fetch(
        `https://collectionapi.metmuseum.org/public/collection/v1/objects/${firstId}`
      )
      const detail = await detailRes.json()
      const pageRes = await fetch(
        `http://localhost:5174/proxy?url=${encodeURIComponent(
          detail.objectURL!
        )}`
      )
      const html = await pageRes.text()
      const doc = new DOMParser().parseFromString(html, 'text/html')
      const mdSpan = doc.querySelectorAll(
        'span[data-sentry-element="Markdown"]'
      )[4]
      const markdownText = mdSpan?.textContent?.trim() ?? null
      
      return {detail, markdownText }
      
    },
  })
  if (isLoading) return <p>로딩 중...</p>
  if (error) return <p>에러 발생: {(error as Error).message}</p>
  if (!data) return <p>데이터 없음</p>

  const { detail, markdownText } = data 

  return (
    <div style={{ padding: '20px' }}>
      <h2>{detail.title}</h2>
      <p>{detail.artistDisplayName}</p>
      <img
        src={detail.primaryImageSmall || detail.primaryImage}
        alt={detail.title}
        style={{
          maxWidth: '300px',
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        }}
      />
      <p style={{ whiteSpace: 'pre-wrap' }}>{markdownText}</p>
    </div>
  )
}
