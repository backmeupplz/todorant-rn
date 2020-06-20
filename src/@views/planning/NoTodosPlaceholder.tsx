import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { View, H1, Text } from 'native-base'
import { sharedColors } from '@utils/sharedColors'
import { translate } from '@utils/i18n'

@observer
export class NoTodosPlaceholder extends Component {
  render() {
    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          alignItems: 'center',
          margin: 12,
        }}
      >
        <H1
          style={{
            color: sharedColors.textColor,
            marginHorizontal: 24,
            marginBottom: 12,
          }}
        >
          👀
        </H1>
        <H1
          style={{
            color: sharedColors.textColor,
            opacity: 0.9,
            marginHorizontal: 24,
            marginBottom: 16,
          }}
        >
          {translate('noTodosExistTitle')}
        </H1>
        <Text
          style={{
            textAlign: 'center',
            color: sharedColors.textColor,
            opacity: 0.8,
            marginHorizontal: 24,
          }}
        >
          {translate('noTodosExistText')}
        </Text>
      </View>
    )
  }
}
