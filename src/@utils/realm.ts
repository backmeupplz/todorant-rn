import { DelegationUser, DelegationUserInTodo } from '@models/DelegationUser'
import { Tag } from '@models/Tag'
import { Todo } from '@models/Todo'
import Realm from 'realm'

export const realm = new Realm({
  schema: [DelegationUser, Todo, Tag, DelegationUserInTodo],
  schemaVersion: 255,
})
