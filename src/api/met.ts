export type Department = {
  departmentId: number
  displayName: string
}

export type DepartmentsResponse = {
  departments: Department[]
}

export async function fetchDepartments(): Promise<DepartmentsResponse> {
  const res = await fetch('/api/departments')
  if (!res.ok) throw new Error('departments fetch failed')
  return res.json()
}
