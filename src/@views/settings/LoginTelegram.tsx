import React, { Component } from 'react'
import { WebView } from 'react-native-webview'
import { sharedColors } from '@utils/sharedColors'
import { observer } from 'mobx-react'
import { goBack, navigationRef } from '@utils/navigation'
import { alertError } from '@utils/alert'
import { User } from '@models/User'
import { sharedSessionStore } from '@stores/SessionStore'

const base = __DEV__ ? 'http://192.168.31.27:8080' : 'https://todorant.com'

@observer
export class LoginTelegram extends Component {
  render() {
    return (
      <WebView
        source={{ uri: `${base}/mobile-login/telegram` }}
        style={{ flex: 1, backgroundColor: sharedColors.backgroundColor }}
        onLoadStart={e => {
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
              setTimeout(() => {
                if (navigationRef.current?.canGoBack) {
                  goBack()
                }
              }, 1000)
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
