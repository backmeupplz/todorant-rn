import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import BottomTabNavigator from './src/@views/BottomTabNavigator'
import { navigationRef } from './src/@utils/navigation'
import { GoogleSignin } from '@react-native-community/google-signin'
import '@utils/network'
import '@utils/ignoreWarnings'
import { Root } from 'native-base'

GoogleSignin.configure({
  webClientId:
    '989382323327-rou6lmk2umbnoaq55493v1kqm8fvp22q.apps.googleusercontent.com',
  offlineAccess: true,
  forceConsentPrompt: true,
})

const App = () => {
  return (
    <Root>
      <NavigationContainer ref={navigationRef}>
        <BottomTabNavigator />
      </NavigationContainer>
    </Root>
  )
}

export default App
