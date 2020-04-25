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
        <H1 {...sharedColors.textExtraStyle}>🎉</H1>
        <H1 {...sharedColors.textExtraStyle}>{translate('allDoneTitle')}</H1>
        <Text style={{ textAlign: 'center', color: sharedColors.textColor }}>
          {translate('allDoneText')}
        </Text>
      </View>
    )
  }
}
