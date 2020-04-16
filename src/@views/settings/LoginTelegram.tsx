import React, { Component } from 'react'
import { WebView } from 'react-native-webview'
import { sharedColors } from '@utils/sharedColors'
import { observer } from 'mobx-react'
import { goBack } from '@utils/navigation'
import { alertError } from '@utils/alert'
import { User } from '@models/User'
import { sharedSessionStore } from '@stores/SessionStore'
import { useRoute, RouteProp } from '@react-navigation/native'

const base = __DEV__ ? 'http://192.168.31.27:8080' : 'https://todorant.com'

@observer
class LoginTelegramContent extends Component<{
  route: RouteProp<
    Record<string, { setLoadingToTrue: () => void } | undefined>,
    string
  >
}> {
  render() {
    return (
      <WebView
        source={{ uri: `${base}/mobile-login/telegram` }}
        style={{ flex: 1, backgroundColor: sharedColors.backgroundColor }}
        onLoadStart={(e) => {
          try {
            const url = e.nativeEvent.url
            if (url.includes('mobile_login_success')) {
              const userInfo = JSON.parse(
                decodeURI(url.replace(`${base}/mobile_login_success?data=`, ''))
              ) as User
              userInfo.createdAt = new Date(userInfo.createdAt)
              userInfo.updatedAt = new Date(userInfo.updatedAt)
              sharedSessionStore.login(userInfo)
              goBack()
              this.props.route.params?.setLoadingToTrue()
            }
          } catch (err) {
            goBack()
            alertError(err)
          }
        }}
      />
    )
  }
}

export const LoginTelegram = () => {
  const route = useRoute<
    RouteProp<
      Record<string, { setLoadingToTrue: () => void } | undefined>,
      string
    >
  >()
  return <LoginTelegramContent route={route} />
}
