import Realm from 'realm'
import { Tag } from '@models/Tag'
import { Todo } from '@models/Todo'
import { DelegationUser } from '@models/DelegationUser'

export const realm = new Realm({
  schema: [Todo.schema, Tag.schema, DelegationUser.schema],
  schemaVersion: 9,
})
