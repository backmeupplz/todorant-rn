import { Component } from 'react'
import { MelonTodo } from '@models/MelonTodo'
import { Text } from 'native-base'
import { observer } from 'mobx-react'
import { sharedColors } from '@utils/sharedColors'
import React from 'react'
import moment from 'moment'

@observer
export class DebugTodoInfo extends Component<{ todo: MelonTodo }> {
  render() {
    return (
      <>
        <Text {...sharedColors.textExtraStyle}>
          {this.props.todo._id || 'no id'}
        </Text>
        <Text {...sharedColors.textExtraStyle}>
          {this.props.todo._tempSyncId || 'no sync id'}
        </Text>
        <Text {...sharedColors.textExtraStyle}>
          {this.props.todo.createdAt
            ? moment(this.props.todo.createdAt).format('YYYY-MM-DD hh:mm:ss')
            : 'no created at'}
        </Text>
        <Text {...sharedColors.textExtraStyle}>
          {this.props.todo.updatedAt
            ? moment(this.props.todo.updatedAt).format('YYYY-MM-DD hh:mm:ss')
            : 'no updated at'}
        </Text>
      </>
    )
  }
}
