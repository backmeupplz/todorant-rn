import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { Text } from 'native-base'
import { sharedColors } from '@utils/sharedColors'
import moment from 'moment'
import { MelonTodo } from '@models/MelonTodo'

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
