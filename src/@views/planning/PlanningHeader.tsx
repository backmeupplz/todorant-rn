import { observer } from 'mobx-react'
import React, { Component } from 'react'
import { sharedAppStateStore } from '@stores/AppStateStore'
import { sharedColors } from '@utils/sharedColors'
import { Text, Input, View } from 'native-base'
import { PlanningHeaderSegment } from '@views/planning/PlanningHeaderSegment'
import { translate } from '@utils/i18n'
import { Dimensions } from 'react-native'
import { makeObservable, observable } from 'mobx'

@observer
export class PlanningHeader extends Component {
  @observable width = Dimensions.get('window').width

  UNSAFE_componentWillMount() {
    makeObservable(this)
  }

  componentDidMount() {
    Dimensions.addEventListener('change', () => {
      this.width = Dimensions.get('window').width
    })
  }

  render() {
    return sharedAppStateStore.hash.length ? (
      <View style={{ marginRight: 24 }}>
        <Text
          {...sharedColors.textExtraStyle}
          numberOfLines={1}
          ellipsizeMode={'tail'}
        >
          {sharedAppStateStore.hash}
        </Text>
      </View>
    ) : sharedAppStateStore.searchEnabled ? (
      <Input
        style={{
          color: sharedColors.textColor,
          width: this.width * 0.65,
        }}
        placeholder={`${translate('search')}...`}
        placeholderTextColor={sharedColors.placeholderColor}
        autoFocus
        value={sharedAppStateStore.searchQuery[0]}
        onChangeText={(text) => {
          sharedAppStateStore.searchQuery = [text]
        }}
      />
    ) : (
      <View style={{ width: this.width * 0.65, marginLeft: -24 }}>
        <PlanningHeaderSegment />
      </View>
    )
  }
}
