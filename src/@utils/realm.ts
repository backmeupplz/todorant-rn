import Realm from 'realm'
import { Todo } from '@models/Todo'

export const realm = new Realm({ schema: [Todo] })
