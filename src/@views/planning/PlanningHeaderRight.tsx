import { observer } from 'mobx-react'
import React, { Component } from 'react'
import { sharedAppStateStore } from '@stores/AppStateStore'
import { Icon } from 'native-base'
import { sharedColors } from '@utils/sharedColors'
import { InfoButton } from '@components/InfoButton'
import { TouchableOpacity } from 'react-native-gesture-handler'

@observer
export class PlanningHeaderRight extends Component {
  render() {
    return sharedAppStateStore.hash ? (
      <TouchableOpacity
        onPress={() => {
          sharedAppStateStore.hash = ''
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
      InfoButton('infoPlanning')()
    )
  }
}
