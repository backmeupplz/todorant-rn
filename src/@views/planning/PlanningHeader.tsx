import { observer } from 'mobx-react'
import React, { Component } from 'react'
import { sharedAppStateStore } from '@stores/AppStateStore'
import { sharedColors } from '@utils/sharedColors'
import { Text } from 'native-base'
import { PlanningHeaderSegment } from '@views/planning/PlanningHeaderSegment'

@observer
export class PlanningHeader extends Component {
  render() {
    return sharedAppStateStore.hash ? (
      <Text {...sharedColors.textExtraStyle}>{sharedAppStateStore.hash}</Text>
    ) : (
      <PlanningHeaderSegment />
    )
  }
}
