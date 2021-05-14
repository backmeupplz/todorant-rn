import { Tag } from '@models/Tag'
import { Todo } from '@models/Todo'
import { realm } from '@utils/realm'

export function gatherData() {
  const todos = realm.objects(Todo)
  const tags = realm.objects(Tag)
  return { todos, tags }
}
