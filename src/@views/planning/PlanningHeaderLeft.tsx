import { Icon } from 'native-base'
import { TodoSectionType, sharedAppStateStore } from '@stores/AppStateStore'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { observer } from 'mobx-react'
import { sharedColors } from '@utils/sharedColors'
import { sharedOnboardingStore } from '@stores/OnboardingStore'
import React, { Component } from 'react'

@observer
export class PlanningHeaderLeft extends Component {
  render() {
    return (
      !sharedAppStateStore.hash.length && (
        <TouchableOpacity
          disabled={!sharedOnboardingStore.tutorialIsShown}
          onPress={() => {
            sharedAppStateStore.changeLoading(false)
            sharedAppStateStore.searchQuery = []
            sharedAppStateStore.searchEnabled =
              !sharedAppStateStore.searchEnabled
          }}
          style={{ marginLeft: 12 }}
        >
          <Icon
            type="MaterialIcons"
            name={sharedAppStateStore.searchEnabled ? 'close' : 'search'}
            style={{ color: sharedColors.textColor, opacity: 0.5 }}
          />
        </TouchableOpacity>
      )
    )
  }
}
