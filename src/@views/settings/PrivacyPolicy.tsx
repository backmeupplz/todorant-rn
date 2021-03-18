import React, { Component } from 'react'
import { WebView } from 'react-native-webview'
import { sharedColors } from '@utils/sharedColors'
import { observer } from 'mobx-react'
import { makeObservable, observable } from 'mobx'
import { Spinner } from '@components/Spinner'

@observer
export class PrivacyPolicy extends Component {
  @observable loading = true

  UNSAFE_componentWillMount() {
    makeObservable(this)
  }

  render() {
    return (
      <>
        {this.loading && <Spinner />}
        <WebView
          onLoadEnd={() => {
            this.loading = false
          }}
          source={{ uri: 'https://todorant.com/privacy' }}
          style={{ flex: 1, backgroundColor: sharedColors.backgroundColor }}
        />
      </>
    )
  }
}
