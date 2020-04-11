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
        <H1 {...sharedColors.textExtraStyle}>👀</H1>
        <H1 {...sharedColors.textExtraStyle}>
          {translate('noTodosExistTitle')}
        </H1>
        <Text style={{ textAlign: 'center', color: sharedColors.textColor }}>
          {translate('noTodosExistText')}
        </Text>
      </View>
    )
  }
}
