import { observer } from 'mobx-react'
import React, { Component } from 'react'
import { sharedAppStateStore } from '@stores/AppStateStore'
import { Button, Icon } from 'native-base'
import { extraButtonProps } from '@utils/extraButtonProps'
import { sharedColors } from '@utils/sharedColors'
import { InfoButton } from '@views/settings/InfoButton'

@observer
export class PlanningHeaderRight extends Component {
  render() {
    return sharedAppStateStore.hash ? (
      <Button
        icon
        {...extraButtonProps(sharedColors)}
        small
        onPress={() => {
          sharedAppStateStore.hash = ''
        }}
      >
        <Icon
          type="MaterialIcons"
          name="close"
          {...sharedColors.iconExtraStyle}
        />
      </Button>
    ) : (
      InfoButton('infoPlanning')()
    )
  }
}
