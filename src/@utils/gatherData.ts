import { Tag } from '@models/Tag'
import { Todo } from '@models/Todo'
import { realm } from '@utils/realm'

export function gatherData() {
  const todos = realm.objects<Todo>(Todo)
  const tags = realm.objects<Tag>(Tag)
  return { todos, tags }
}
