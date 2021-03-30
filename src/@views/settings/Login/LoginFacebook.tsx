import React, { Component } from 'react'
import { WebView } from 'react-native-webview'
import { sharedColors } from '@utils/sharedColors'
import { observer } from 'mobx-react'
import { goBack } from '@utils/navigation'
import { alertError } from '@utils/alert'
import { useRoute, RouteProp } from '@react-navigation/native'
import * as rest from '@utils/rest'
import { makeObservable, observable } from 'mobx'
import { translate } from '@utils/i18n'
import { Spinner } from '@components/Spinner'
import { View } from 'native-base'
import { sharedSessionStore } from '@stores/SessionStore'

@observer
class LoginFacebookContent extends Component<{
  route: RouteProp<
    Record<string, { setLoadingToTrue: () => void } | undefined>,
    string
  >
}> {
  @observable gotToken = false
  @observable initialLoad = true

  UNSAFE_componentWillMount() {
    makeObservable(this)
  }

  getAccessToken(url: string) {
    const match = RegExp('access_token=([^&.]+)&').exec(url)
    return match && match[1]
  }

  render() {
    return (
      <>
        {this.initialLoad && <Spinner />}
        {this.gotToken ? (
          <View
            style={{ backgroundColor: sharedColors.backgroundColor, flex: 1 }}
          >
            <Spinner />
          </View>
        ) : (
          <View
            style={{ flex: 1, backgroundColor: sharedColors.backgroundColor }}
          >
            <WebView
              source={{
                uri: `https://www.facebook.com/dialog/oauth?client_id=640750769753434&redirect_uri=https://facebook.com/connect/login_success.html&scope=email,public_profile&response_type=token&auth_type=rerequest`,
              }}
              style={{ flex: 1, backgroundColor: sharedColors.backgroundColor }}
              onLoadStart={async (e) => {
                try {
                  const url = e.nativeEvent.url
                  console.log(url)
                  if (url.includes('login_success') && !url.includes('oauth')) {
                    const token = this.getAccessToken(url)
                    if (!token) {
                      throw new Error(translate('facebookPermissionsError'))
                    }
                    this.gotToken = true
                    const userInfo = (await rest.loginFacebook(token)).data
                    userInfo.createdAt = new Date(userInfo.createdAt)
                    if (userInfo.updatedAt) {
                      userInfo.updatedAt = new Date(userInfo.updatedAt)
                    }
                    sharedSessionStore.login(userInfo)
                    goBack()
                    this.props.route.params?.setLoadingToTrue()
                  }
                } catch (err) {
                  goBack()
                  alertError(err)
                }
              }}
              onLoadEnd={() => {
                this.initialLoad = false
              }}
            />
          </View>
        )}
      </>
    )
  }
}

export const LoginFacebook = () => {
  const route = useRoute<
    RouteProp<
      Record<string, { setLoadingToTrue: () => void } | undefined>,
      string
    >
  >()
  return <LoginFacebookContent route={route} />
}
