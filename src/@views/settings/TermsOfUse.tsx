import React, { Component } from 'react'
import { WebView } from 'react-native-webview'

export class TermsOfUse extends Component {
  render() {
    return (
      <WebView
        source={{ uri: 'https://todorant.com/terms' }}
        style={{ flex: 1 }}
      />
    )
  }
}
