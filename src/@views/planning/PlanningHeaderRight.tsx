import CustomIcon from '@components/CustomIcon'
import { sharedAppStateStore } from '@stores/AppStateStore'
import { sharedColors } from '@utils/sharedColors'
import { observer } from 'mobx-react'
import { Icon } from 'native-base'
import React, { Component } from 'react'
import { View } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'

@observer
export class PlanningHeaderRight extends Component {
  render() {
    return sharedAppStateStore.hash.length ? (
      <TouchableOpacity
        onPress={() => {
          sharedAppStateStore.hash = []
        }}
        style={{ marginRight: 12 }}
      >
        <Icon
          type="MaterialIcons"
          name="close"
          style={{ color: sharedColors.textColor, opacity: 0.5 }}
        />
      </TouchableOpacity>
    ) : (
      <View style={{ flexDirection: 'row' }}>
        <TouchableOpacity
          onPress={() => {
            sharedAppStateStore.calendarEnabled = !sharedAppStateStore.calendarEnabled
          }}
        >
          <CustomIcon
            name={'calendar_outline_28--event'}
            color={sharedColors.textColor}
            size={28}
            style={{ opacity: 0.5, marginRight: 12 }}
          />
        </TouchableOpacity>
      </View>
    )
  }
}
