import { observer } from 'mobx-react'
import React, { Component } from 'react'
import { sharedAppStateStore, TodoSectionType } from '@stores/AppStateStore'
import { Icon } from 'native-base'
import { sharedColors } from '@utils/sharedColors'
import { TouchableOpacity } from 'react-native-gesture-handler'

@observer
export class PlanningHeaderLeft extends Component {
  render() {
    return (
      !sharedAppStateStore.hash.length &&
      sharedAppStateStore.todoSection === TodoSectionType.planning && (
        <TouchableOpacity
          onPress={() => {
            sharedAppStateStore.changeLoading(false)
            sharedAppStateStore.searchQuery = []
            sharedAppStateStore.searchEnabled = !sharedAppStateStore.searchEnabled
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
