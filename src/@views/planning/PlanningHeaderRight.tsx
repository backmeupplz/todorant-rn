import { Icon, Spinner, View } from 'native-base'
import { InfoButton } from '@components/InfoButton'
import { TodoSectionType, sharedAppStateStore } from '@stores/AppStateStore'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { observer } from 'mobx-react'
import { sharedColors } from '@utils/sharedColors'
import { sharedOnboardingStore } from '@stores/OnboardingStore'
import CustomIcon from '@components/CustomIcon'
import React, { Component } from 'react'

@observer
export class PlanningHeaderRight extends Component {
  render() {
    return sharedAppStateStore.hash.length ? (
      <TouchableOpacity
        onPress={() => {
          sharedAppStateStore.changeLoading(false)
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
        {sharedAppStateStore.loading ? (
          <View style={{ marginRight: 12, opacity: 0.5 }}>
            <Spinner color={sharedColors.textColor} size={28} />
          </View>
        ) : sharedAppStateStore.todoSection === TodoSectionType.planning ? (
          <TouchableOpacity
            disabled={!sharedOnboardingStore.tutorialIsShown}
            onPress={() => {
              sharedAppStateStore.calendarEnabled =
                !sharedAppStateStore.calendarEnabled
            }}
          >
            <CustomIcon
              name={'calendar_outline_28--event'}
              color={sharedColors.textColor}
              size={28}
              style={{ opacity: 0.5, marginRight: 12 }}
            />
          </TouchableOpacity>
        ) : (
          InfoButton('infoPlanning')()
        )}
      </View>
    )
  }
}
