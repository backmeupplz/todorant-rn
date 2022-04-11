import { Component } from 'react'
import { Spinner } from '@components/Spinner'
import { View } from 'native-base'
import { WebView } from 'react-native-webview'
import { makeObservable, observable } from 'mobx'
import { observer } from 'mobx-react'
import { sharedColors } from '@utils/sharedColors'
import React from 'react'

@observer
export class PrivacyPolicy extends Component {
  @observable loading = true

  UNSAFE_componentWillMount() {
    makeObservable(this)
  }

  render() {
    return (
      <View style={{ flex: 1, backgroundColor: sharedColors.backgroundColor }}>
        {this.loading && <Spinner />}
        <WebView
          onLoadEnd={() => {
            this.loading = false
          }}
          source={{ uri: 'https://todorant.com/privacy' }}
          style={{ flex: 1, backgroundColor: sharedColors.backgroundColor }}
        />
      </View>
    )
  }
}
