import { MelonTodo } from '@models/MelonTodo'

export interface TodoSection {
  section: string
  data: MelonTodo[]
  order: number
}
