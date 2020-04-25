import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { View, H1, Text } from 'native-base'
import { sharedColors } from '@utils/sharedColors'
import { translate } from '@utils/i18n'
import { sharedAppStateStore } from '@stores/AppStateStore'

@observer
export class NoTodosPlaceholder extends Component {
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
          margin: 12,
        }}
      >
        <H1 {...sharedColors.textExtraStyle}>🐝</H1>
        <H1 {...sharedColors.textExtraStyle}>{translate('noTodosTitle')}</H1>
        <Text style={{ textAlign: 'center', color: sharedColors.textColor }}>
          {translate('noTodosText')}
        </Text>
      </View>
    )
  }
}
