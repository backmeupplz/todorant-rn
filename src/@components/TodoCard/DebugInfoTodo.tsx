import { MelonTodo } from '@models/MelonTodo'
import { Text } from 'native-base'
import { observer } from 'mobx-react'
import { sharedColors } from '@utils/sharedColors'
import React from 'react'
import moment from 'moment'

export const DebugTodoInfo = observer(({ todo }: { todo: MelonTodo }) => {
  return (
    <>
      <Text {...sharedColors.textExtraStyle}>{todo._id || 'no id'}</Text>
      <Text {...sharedColors.textExtraStyle}>
        {todo._tempSyncId || 'no sync id'}
      </Text>
      <Text {...sharedColors.textExtraStyle}>
        {todo.createdAt
          ? moment(todo.createdAt).format('YYYY-MM-DD hh:mm:ss')
          : 'no created at'}
      </Text>
      <Text {...sharedColors.textExtraStyle}>
        {todo.updatedAt
          ? moment(todo.updatedAt).format('YYYY-MM-DD hh:mm:ss')
          : 'no updated at'}
      </Text>
    </>
  )
})
