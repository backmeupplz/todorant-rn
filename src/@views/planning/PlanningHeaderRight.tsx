import { observer } from 'mobx-react'
import React, { Component } from 'react'
import { sharedAppStateStore } from '@stores/AppStateStore'
import { Icon } from 'native-base'
import { extraButtonProps } from '@utils/extraButtonProps'
import { sharedColors } from '@utils/sharedColors'
import { InfoButton } from '@components/InfoButton'
import { Button } from '@components/Button'

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
