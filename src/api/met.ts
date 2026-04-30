export type Department = {
  departmentId: number
  displayName: string
}

export type DepartmentsResponse = {
  departments: Department[]
}

export async function fetchDepartments(): Promise<DepartmentsResponse> {
  const res = await fetch('/api/departments')

  if (!res.ok) {
    const text = await res.text()
    console.error('departments fetch failed:', res.status, text)
    throw new Error(`departments fetch failed: ${res.status}`)
  }

  return res.json()
}
