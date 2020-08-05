import { observer } from 'mobx-react'
import React, { Component } from 'react'
import { sharedAppStateStore } from '@stores/AppStateStore'
import { sharedColors } from '@utils/sharedColors'
import { Text, Input, View } from 'native-base'
import { PlanningHeaderSegment } from '@views/planning/PlanningHeaderSegment'
import { translate } from '@utils/i18n'
import { Dimensions } from 'react-native'
import { observable } from 'mobx'

@observer
export class PlanningHeader extends Component {
  @observable width = Dimensions.get('window').width

  componentWillMount() {
    Dimensions.addEventListener('change', () => {
      this.width = Dimensions.get('window').width
    })
  }

  render() {
    return sharedAppStateStore.hash ? (
      <Text {...sharedColors.textExtraStyle}>
        {sharedAppStateStore.hash.join(' ')}
      </Text>
    ) : sharedAppStateStore.searchEnabled ? (
      <Input
        style={{
          color: sharedColors.textColor,
          width: this.width * 0.65,
        }}
        placeholder={`${translate('search')}...`}
        placeholderTextColor={sharedColors.placeholderColor}
        autoFocus
        onChangeText={(text) => {
          sharedAppStateStore.searchQuery = [text]
        }}
      />
    ) : (
      <View style={{ width: this.width * 0.65 }}>
        <PlanningHeaderSegment />
      </View>
    )
  }
}
