import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { l } from '@utils/linkify'
import { Text } from 'native-base'
import { sharedColors } from '@utils/sharedColors'
import { Linking } from 'react-native'
import { sharedAppStateStore } from '@stores/AppStateStore'
import { sharedTagStore } from '@stores/TagStore'

@observer
export class TodoText extends Component<{ text: string; isOld: boolean }> {
  get linkifiedText() {
    return l(this.props.text)
  }

  render() {
    return (
      <Text>
        {this.linkifiedText.map((p, i) => (
          <Text
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
            onPress={() => {
              if (p.type === 'link' && p.url) {
                Linking.openURL(p.url)
              } else if (p.type === 'hash') {
                sharedAppStateStore.hash = p.value
              }
            }}
          >
            {p.value}
          </Text>
        ))}
      </Text>
    )
  }
}
