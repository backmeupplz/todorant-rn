import { Todo } from '@models/Todo'
import { SectionListData } from 'react-native'

export interface TodoSection<T> {
  section: string
  data: (Todo | SectionListData<T>)[]
  order: number
}
