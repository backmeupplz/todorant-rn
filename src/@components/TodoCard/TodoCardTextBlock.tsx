import { observer } from 'mobx-react'
import React, { Component } from 'react'
import { Todo } from '@models/Todo'
import { Text, View } from 'native-base'
import { sharedColors } from '@utils/sharedColors'
import { l } from '@utils/linkify'
import { Linking } from 'react-native'
import { sharedAppStateStore } from '@stores/AppStateStore'
import { sharedTagStore } from '@stores/TagStore'
import { TouchableOpacity } from 'react-native-gesture-handler'

const debug = false

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
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          flex: 1,
        }}
      >
        {this.props.isOld && <Text style={{ color: 'tomato' }}>! </Text>}
        {__DEV__ && debug && (
          <Text
            style={{ ...sharedColors.textExtraStyle.style }}
          >{`(${this.props.todo.order}) `}</Text>
        )}
        {__DEV__ && debug && (
          <Text
            style={{ ...sharedColors.textExtraStyle.style }}
          >{`(${this.props.todo.frogFails}) `}</Text>
        )}
        {this.props.todo.frog && (
          <Text style={{ ...sharedColors.textExtraStyle.style }}>🐸 </Text>
        )}
        {this.props.todo.time && (
          <Text
            style={{ ...sharedColors.textExtraStyle.style }}
          >{`${this.props.todo.time} `}</Text>
        )}
        {this.linkifiedText.map((p, i) =>
          p.type === 'text' ? (
            <Text
              key={i}
              style={{
                color: sharedColors.textColor,
              }}
            >
              {p.value}
            </Text>
          ) : (
            <TouchableOpacity
              key={i}
              onPress={() => {
                if (p.type === 'link' && p.url) {
                  Linking.openURL(p.url)
                } else if (p.type === 'hash') {
                  sharedAppStateStore.hash = p.value
                }
              }}
            >
              <Text
                style={{
                  color:
                    p.type === 'url'
                      ? 'dodgerblue'
                      : sharedTagStore.tagColorMap[p.url?.substr(1) || ''] ||
                        'dodgerblue',
                }}
              >
                {p.value}
              </Text>
            </TouchableOpacity>
          )
        )}
      </View>
    )
  }
}
