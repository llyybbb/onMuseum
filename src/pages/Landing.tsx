import { Link } from 'react-router-dom'
import { useDepartments } from '../hooks/useDepartments'

export default function Landing() {
  const { data, isLoading, error } = useDepartments()
  if (isLoading) return <p>로딩 중...</p>
  if (error) return <p>에러 발생: {(error as Error).message}</p>
  if (!data) return <p>데이터 없음</p>
  const departments = data?.departments ?? []

  return (
    <>
      <h1>Categories</h1>
      <div className="flex gap-5">
        {departments.map((dept) => (
          <Link
            to={`/hall/${dept.departmentId}`}
            state={{ departmentName: dept.displayName }}
          >
            <p key={dept.departmentId} className="cursor-pointer">
              {dept.displayName}
            </p>
          </Link>
        ))}
      </div>
    </>
  )
}
