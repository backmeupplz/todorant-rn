import { Todo } from '@models/Todo'

export interface TodoSection {
  section: string
  data: Todo[]
  order: number
}
