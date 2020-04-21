import { observer } from 'mobx-react'
import React, { Component } from 'react'
import { Todo } from '@models/Todo'
import { Text } from 'native-base'
import { sharedColors } from '@utils/sharedColors'
import { l } from '@utils/linkify'
import { Linking } from 'react-native'
import { sharedAppStateStore } from '@stores/AppStateStore'
import { sharedTagStore } from '@stores/TagStore'

@observer
export class TodoCardTextBlock extends Component<{
  todo: Todo
  isOld: boolean
}> {
  get linkifiedText() {
    return l(this.props.todo.text)
  }

  render() {
    return (
      <Text>
        <Text style={{ ...sharedColors.textExtraStyle.style }}>
          {this.props.isOld && <Text style={{ color: 'tomato' }}>! </Text>}
          {__DEV__ && `(${this.props.todo.order}) `}
          {this.props.todo.frog ? '🐸 ' : ''}
          {this.props.todo.time ? `${this.props.todo.time} ` : ''}
        </Text>
        {this.linkifiedText.map((p, i) => (
          <Text
            onPress={
              p.type !== 'text'
                ? () => {
                    if (p.type === 'link' && p.url) {
                      Linking.openURL(p.url)
                    } else if (p.type === 'hash') {
                      sharedAppStateStore.hash = p.value
                    }
                  }
                : undefined
            }
            key={i}
            style={{
              color:
                p.type !== 'text'
                  ? p.type === 'url'
                    ? 'dodgerblue'
                    : sharedTagStore.tagColorMap[p.url?.substr(1) || ''] ||
                      'dodgerblue'
                  : sharedColors.textColor,
            }}
          >
            {p.value}
          </Text>
        ))}
      </Text>
    )
  }
}
