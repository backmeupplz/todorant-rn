import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import BottomTabNavigator from './src/@views/BottomTabNavigator'
import { navigationRef } from './src/@utils/navigation'

const App = () => {
  return (
    <NavigationContainer ref={navigationRef}>
      <BottomTabNavigator />
    </NavigationContainer>
  )
}

export default App
