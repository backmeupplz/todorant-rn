import { Component } from 'react'
import { Dimensions, Platform } from 'react-native'
import { Input, Text, View } from 'native-base'
import { PlanningHeaderSegment } from '@views/planning/PlanningHeaderSegment'
import { makeObservable, observable } from 'mobx'
import { observer } from 'mobx-react'
import { sharedAppStateStore } from '@stores/AppStateStore'
import { sharedColors } from '@utils/sharedColors'
import { translate } from '@utils/i18n'
import React from 'react'

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
      <View
        style={{
          width: this.width * 0.65,
          marginLeft: Platform.OS === 'ios' ? -24 : 0,
        }}
      >
        <PlanningHeaderSegment />
      </View>
    )
  }
}
