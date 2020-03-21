import React, { Component } from 'react'
import { WebView } from 'react-native-webview'
import { sharedColors } from '@utils/sharedColors'
import { observer } from 'mobx-react'

@observer
export class PrivacyPolicy extends Component {
  render() {
    return (
      <WebView
        source={{ uri: 'https://todorant.com/privacy' }}
        style={{ flex: 1, backgroundColor: sharedColors.backgroundColor }}
      />
    )
  }
}
