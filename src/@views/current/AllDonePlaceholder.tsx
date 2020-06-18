import React, { Component } from 'react'
import { View, H1, Text } from 'native-base'
import { observer } from 'mobx-react'
import { sharedColors } from '@utils/sharedColors'
import { translate } from '@utils/i18n'
import { sharedAppStateStore } from '@stores/AppStateStore'

@observer
export class AllDonePlaceholder extends Component {
  render() {
    // Hack to make this reactive
    let languageTag = sharedAppStateStore.languageTag
    languageTag = `${languageTag}`

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
