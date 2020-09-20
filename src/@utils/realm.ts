import Realm from 'realm'
import { Tag } from '@models/Tag'
import { Todo } from '@models/Todo'

export const realm = new Realm({
  schema: [Todo.schema, Tag.schema],
  schemaVersion: 6,
})
