import React, { Component } from 'react'
import { WebView } from 'react-native-webview'
import { sharedColors } from '@utils/sharedColors'
import { observer } from 'mobx-react'
import { observable } from 'mobx'
import { Spinner } from 'native-base'

@observer
export class TermsOfUse extends Component {
  @observable loading = true

  render() {
    return (
      <>
        {this.loading && (
          <Spinner style={{ backgroundColor: sharedColors.backgroundColor }} />
        )}
        <WebView
          onLoadEnd={() => {
            this.loading = false
          }}
          source={{ uri: 'https://todorant.com/terms' }}
          style={{ flex: 1, backgroundColor: sharedColors.backgroundColor }}
        />
      </>
    )
  }
}
