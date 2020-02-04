import { Settings } from './settings/Settings'
import { Planning } from './planning/Planning'
import { Current } from './current/Current'
import { createBottomTabNavigator } from 'react-navigation-tabs'
import { createAppContainer } from 'react-navigation'

export default createAppContainer(
  createBottomTabNavigator(
    {
      Current,
      Planning,
      Settings,
    },
    {
      tabBarOptions: {
        activeTintColor: 'tomato',
        inactiveTintColor: 'gray',
      },
    }
  )
)
