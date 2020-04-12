import { observer } from 'mobx-react'
import React, { Component } from 'react'
import { sharedAppStateStore, PlanningMode } from '@stores/AppStateStore'
import { sharedColors } from '@utils/sharedColors'
import { translate } from '@utils/i18n'
import { Text } from 'native-base'
import { PlanningHeaderSegment } from '@views/planning/PlanningHeaderSegment'

@observer
export class PlanningHeader extends Component {
  render() {
    return sharedAppStateStore.hash ? (
      <Text {...sharedColors.textExtraStyle}>{sharedAppStateStore.hash}</Text>
    ) : sharedAppStateStore.planningMode === PlanningMode.rearrange ? (
      <Text {...sharedColors.textExtraStyle}>{translate('rearrange')}</Text>
    ) : (
      <PlanningHeaderSegment />
    )
  }
}
