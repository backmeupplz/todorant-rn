import React, { Component } from 'react'
import { WebView } from 'react-native-webview'

export class PrivacyPolicy extends Component {
  render() {
    return (
      <WebView
        source={{ uri: 'https://todorant.com/privacy' }}
        style={{ flex: 1 }}
      />
    )
  }
}
