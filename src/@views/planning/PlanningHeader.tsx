import { observer } from 'mobx-react'
import React, { Component } from 'react'
import { sharedAppStateStore } from '@stores/AppStateStore'
import { sharedColors } from '@utils/sharedColors'
import { Text, Input } from 'native-base'
import { PlanningHeaderSegment } from '@views/planning/PlanningHeaderSegment'
import { translate } from '@utils/i18n'
import { Dimensions } from 'react-native'

@observer
export class PlanningHeader extends Component {
  render() {
    const screen = Dimensions.get('window')
    return sharedAppStateStore.hash ? (
      <Text {...sharedColors.textExtraStyle}>{sharedAppStateStore.hash}</Text>
    ) : sharedAppStateStore.searchEnabled ? (
      <Input
        style={{
          color: sharedColors.textColor,
          width: screen.width - 100,
        }}
        placeholder={`${translate('search')}...`}
        placeholderTextColor={sharedColors.placeholderColor}
        autoFocus
        onChangeText={(text) => {
          sharedAppStateStore.searchQuery = text
        }}
      />
    ) : (
      <PlanningHeaderSegment />
    )
  }
}
