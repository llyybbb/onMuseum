import { useQuery } from '@tanstack/react-query'
import { fetchDepartments, type DepartmentsResponse } from '../api/met'

export function useDepartments() {
  return useQuery<DepartmentsResponse>({
    queryKey: ['departments'],
    queryFn: fetchDepartments,
    staleTime: 1000 * 60 * 60 * 24, // 24h (거의 안 바뀜)
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7d
  })
}
