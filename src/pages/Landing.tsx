import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

type Department = {
  departmentId: number
  displayName: string
}

type DepartmentsResponse = {
  departments: Department[]
}

export default function Landing() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['metDepartments'],
    queryFn: async () => {
      const res = await fetch(
        'https://collectionapi.metmuseum.org/public/collection/v1/departments',
      )
      const json: DepartmentsResponse = await res.json()
      if (!json.departments.length) throw new Error('검색 결과가 없습니다.')

      return json.departments
    },
  })
  if (isLoading) return <p>로딩 중...</p>
  if (error) return <p>에러 발생: {(error as Error).message}</p>
  if (!data) return <p>데이터 없음</p>

  return (
    <>
      <h1>Categories</h1>
      <div className="flex gap-5">
        {data.map((dept) => (
          <Link to={`/hall/${dept.departmentId}`}
          state={{departmentName:dept.displayName}}>
            <p key={dept.departmentId} className="cursor-pointer">
              {dept.displayName}
            </p>
          </Link>
        ))}
      </div>
    </>
  )
}
