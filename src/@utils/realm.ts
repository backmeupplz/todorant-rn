import { DelegationUser } from '@models/DelegationUser'
import { Tag } from '@models/Tag'
import { Todo } from '@models/Todo'
import Realm from 'realm'

export const realm = new Realm({
  schema: [Todo, Tag, DelegationUser],
  schemaVersion: 11,
})
