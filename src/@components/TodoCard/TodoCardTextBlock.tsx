import { observer } from 'mobx-react'
import React, { Component } from 'react'
import { Todo } from '@models/Todo'
import { Text, Toast } from 'native-base'
import { sharedColors } from '@utils/sharedColors'
import { l } from '@utils/linkify'
import { Linking, Clipboard } from 'react-native'
import { sharedAppStateStore } from '@stores/AppStateStore'
import { sharedTagStore } from '@stores/TagStore'
import { translate } from '@utils/i18n'
import { CardType } from '@components/TodoCard/CardType'
import fonts from '@utils/fonts'
import { TodoCardVM } from '@components/TodoCard/TodoCardVM'
import { navigate } from '@utils/navigation'
import { MelonTodo } from '@models/MelonTodo'
import { decrypt } from '@utils/encryption'
import { computed, makeObservable } from 'mobx'

const debug = false

@observer
export class TodoCardTextBlock extends Component<{
  todo: MelonTodo
  isOld: boolean
  type: CardType
  drag?: () => void
  vm: TodoCardVM
}> {
  get linkifiedText() {
    if (this.props.todo.encrypted)
      return l(decrypt(this.props.todo.text) || this.props.todo.text)
    return l(this.props.todo.text)
  }

  render() {
    return (
      <Text
        onLongPress={this.props.drag}
        onPress={() => {
          if (
            this.props.type === CardType.breakdown ||
            this.props.type === CardType.delegation
          ) {
            Clipboard.setString(this.props.todo.text)
            Toast.show({
              text: `"${this.props.todo.text}" ${translate('copied')}`,
            })
          } else {
            this.props.vm.expanded = !this.props.vm.expanded
          }
        }}
        style={{
          flex: 1,
          fontFamily: fonts.SFProTextRegular,
        }}
      >
        {this.props.isOld && <Text style={{ color: 'tomato' }}>! </Text>}
        {__DEV__ && (
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
            <Text
              key={i}
              onPress={() => {
                if (p.type === 'link' && p.url) {
                  Linking.openURL(p.url)
                } else if (p.type === 'hash') {
                  sharedAppStateStore.changeLoading(false)
                  setTimeout(() => {
                    if (sharedAppStateStore.hash.indexOf(p.value) < 0) {
                      sharedAppStateStore.hash.push(p.value)
                      navigate('Planning')
                    }
                  })
                }
              }}
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
          )
        )}
      </Text>
    )
  }
}
