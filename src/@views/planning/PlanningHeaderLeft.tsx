import { observer } from 'mobx-react'
import React, { Component } from 'react'
import { sharedAppStateStore, TodoSectionType } from '@stores/AppStateStore'
import { Icon } from 'native-base'
import { extraButtonProps } from '@utils/extraButtonProps'
import { sharedColors } from '@utils/sharedColors'
import { Button } from '@components/Button'

@observer
export class PlanningHeaderLeft extends Component {
  render() {
    return (
      !sharedAppStateStore.hash &&
      sharedAppStateStore.todoSection === TodoSectionType.planning && (
        <Button
          icon
          {...extraButtonProps(sharedColors)}
          small
          onPress={() => {
            sharedAppStateStore.searchEnabled = !sharedAppStateStore.searchEnabled
          }}
        >
          <Icon
            type="MaterialIcons"
            name={sharedAppStateStore.searchEnabled ? 'close' : 'search'}
            {...sharedColors.iconExtraStyle}
          />
        </Button>
      )
    )
  }
}
