import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import BottomTabNavigator from './src/@views/BottomTabNavigator'
import { navigationRef } from './src/@utils/navigation'
import { GoogleSignin } from '@react-native-community/google-signin'
import '@utils/network'
import '@utils/ignoreWarnings'
import '@utils/purchases'
import { Root, StyleProvider } from 'native-base'
import getTheme from './native-base-theme/components'
import { setI18nConfig } from '@utils/i18n'

setI18nConfig()

GoogleSignin.configure({
  webClientId:
    '989382323327-rou6lmk2umbnoaq55493v1kqm8fvp22q.apps.googleusercontent.com',
  offlineAccess: true,
  forceConsentPrompt: true,
})

console.disableYellowBox = true

const App = () => {
  return (
    <Root>
      <StyleProvider style={getTheme()}>
        <NavigationContainer ref={navigationRef}>
          <BottomTabNavigator />
        </NavigationContainer>
      </StyleProvider>
    </Root>
  )
}

export default App
