import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { createStackNavigator } from '@react-navigation/stack'
import { PlanningContent } from '@views/planning/PlanningContent'
import { PlanningHeader } from '@views/planning/PlanningHeader'
import { PlanningHeaderRight } from '@views/planning/PlanningHeaderRight'
import { PlanningHeaderLeft } from '@views/planning/PlanningHeaderLeft'
import { sharedColors } from '@utils/sharedColors'

const Stack = createStackNavigator()

@observer
export class Planning extends Component {
  render() {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name="Planning"
          component={PlanningContent}
          options={{
            headerTitle: () => <PlanningHeader />,
            headerRight: () => <PlanningHeaderRight />,
            headerLeft: () => <PlanningHeaderLeft />,
            headerTitleAlign: 'center',
            ...sharedColors.headerExtraStyle,
          }}
        />
      </Stack.Navigator>
    )
  }
}
