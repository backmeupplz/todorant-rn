import { MelonTodo } from '@models/MelonTodo'
import { Todo } from '@models/Todo'

export interface TodoSection {
  section: string
  data: MelonTodo[]
  order: number
}
