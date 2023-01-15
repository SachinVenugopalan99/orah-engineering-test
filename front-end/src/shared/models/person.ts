type RolllStateType = "unmark" | "present" | "absent" | "late"
export interface Person {
  id: number
  first_name: string
  last_name: string
  photo_url?: string
  role?: string
  full_name?: string
}

export const PersonHelper = {
  getFullName: (p: Person) => `${p.first_name} ${p.last_name}`,
}
