import React, { Component } from 'react'
import { View, H1, Text } from 'native-base'
import { observer } from 'mobx-react'
import { sharedColors } from '@utils/sharedColors'
import { translate } from '@utils/i18n'

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
        <H1 {...sharedColors.textExtraStyle}>🎉</H1>
        <H1 {...sharedColors.textExtraStyle}>{translate('allDoneTitle')}</H1>
        <Text style={{ textAlign: 'center', color: sharedColors.textColor }}>
          {translate('allDoneText')}
        </Text>
      </View>
    )
  }
}
