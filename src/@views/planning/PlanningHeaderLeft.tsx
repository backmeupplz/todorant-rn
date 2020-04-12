import React, { Component } from 'react'
import { observer } from 'mobx-react'
import {
  sharedAppStateStore,
  TodoSectionType,
  PlanningMode,
} from '@stores/AppStateStore'
import { Button, Icon } from 'native-base'
import { extraButtonProps } from '@utils/extraButtonProps'
import { sharedColors } from '@utils/sharedColors'

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
            sharedAppStateStore.planningMode =
              sharedAppStateStore.planningMode === PlanningMode.default
                ? PlanningMode.rearrange
                : PlanningMode.default
          }}
        >
          <Icon
            type="MaterialIcons"
            name={
              sharedAppStateStore.planningMode === PlanningMode.default
                ? 'format-list-numbered'
                : 'close'
            }
            {...sharedColors.textExtraStyle}
          />
        </Button>
      )
    )
  }
}
