import { Component } from 'react'
import { H1, Text, View } from 'native-base'
import { observer } from 'mobx-react'
import { sharedColors } from '@utils/sharedColors'
import { translate } from '@utils/i18n'
import React from 'react'

@observer
export class AllDonePlaceholder extends Component {
  render() {
    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <H1
          style={{
            color: sharedColors.textColor,
            marginHorizontal: 24,
            marginBottom: 12,
          }}
        >
          🎉
        </H1>
        <H1
          style={{
            color: sharedColors.textColor,
            opacity: 0.9,
            marginHorizontal: 24,
            marginBottom: 16,
          }}
        >
          {translate('allDoneTitle')}
        </H1>
        <Text
          style={{
            textAlign: 'center',
            color: sharedColors.textColor,
            opacity: 0.8,
            marginHorizontal: 24,
          }}
        >
          {translate('allDoneText')}
        </Text>
      </View>
    )
  }
}
