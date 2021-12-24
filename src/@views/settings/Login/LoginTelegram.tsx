import React, { Component } from 'react'
import { WebView } from 'react-native-webview'
import { sharedColors } from '@utils/sharedColors'
import { observer } from 'mobx-react'
import { goBack } from '@utils/navigation'
import { alertError } from '@utils/alert'
import { User } from '@models/User'
import { useRoute, RouteProp } from '@react-navigation/native'
import { makeObservable, observable } from 'mobx'
import { Spinner } from '@components/Spinner'
import { View } from 'native-base'

const base = __DEV__ ? 'http://localhost:8080' : 'https://todorant.com'

@observer
class LoginTelegramContent extends Component<{
  route: RouteProp<
    Record<string, { setLoadingToTrue: (user: User) => void } | undefined>,
    string
  >
}> {
  @observable initialLoad = true

  UNSAFE_componentWillMount() {
    makeObservable(this)
  }

  render() {
    return (
      <>
        {this.initialLoad && <Spinner />}
        <View
          style={{ flex: 1, backgroundColor: sharedColors.backgroundColor }}
        >
          <WebView
            source={{ uri: `${base}/mobile-login/telegram` }}
            style={{ flex: 1, backgroundColor: sharedColors.backgroundColor }}
            onLoadStart={(e) => {
              try {
                const url = e.nativeEvent.url
                if (url.includes('mobile_login_success')) {
                  const userInfo = JSON.parse(
                    decodeURI(
                      url.replace(`${base}/mobile_login_success?data=`, '')
                    )
                  ) as User
                  userInfo.createdAt = new Date(userInfo.createdAt)
                  if (userInfo.updatedAt) {
                    userInfo.updatedAt = new Date(userInfo.updatedAt)
                  }
                  this.props.route.params?.setLoadingToTrue(userInfo)
                }
              } catch (err) {
                goBack()
                alertError(err as string)
              }
            }}
            onLoadEnd={() => {
              this.initialLoad = false
            }}
          />
        </View>
      </>
    )
  }
}

export const LoginTelegram = () => {
  const route =
    useRoute<
      RouteProp<
        Record<string, { setLoadingToTrue: () => void } | undefined>,
        string
      >
    >()
  return <LoginTelegramContent route={route} />
}
