import React, { Component } from 'react'
import { WebView } from 'react-native-webview'
import { sharedColors } from '@utils/sharedColors'
import { observer } from 'mobx-react'
import { RouteProp, useRoute } from '@react-navigation/native'
import { goBack } from '@utils/navigation'

@observer
export class GoogleCalendarContent extends Component<{
  route: RouteProp<
    Record<string, { url: string; authorize: (code: string) => void }>,
    string
  >
}> {
  render() {
    return (
      <WebView
        source={{ uri: this.props.route.params.url }}
        style={{ flex: 1, backgroundColor: sharedColors.backgroundColor }}
        userAgent="Safari/537.36"
        onNavigationStateChange={(evt) => {
          if (evt.url.includes('code')) {
            const codeMatches = /code=(.+)&/.exec(evt.url)
            if (!codeMatches || !codeMatches[0]) {
              return
            }
            const code = decodeURIComponent(
              codeMatches[0].replace('code=', '').replace('&', '')
            )
            goBack()
            this.props.route.params.authorize(code)
          }
        }}
      />
    )
  }
}

export const GoogleCalendar = () => {
  const route = useRoute<
    RouteProp<
      Record<string, { url: string; authorize: (code: string) => void }>,
      string
    >
  >()
  return <GoogleCalendarContent route={route} />
}
