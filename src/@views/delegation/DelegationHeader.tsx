import { DelegationHeaderSegment } from 'src/@views/delegation/DelegationHeaderSegment'
import { Dimensions } from 'react-native'
import { View } from 'native-base'
import { makeObservable, observable } from 'mobx'
import { observer } from 'mobx-react'
import React, { Component } from 'react'

@observer
export class DelegationHeader extends Component {
  @observable width = Dimensions.get('window').width

  UNSAFE_componentWillMount() {
    makeObservable(this)
  }

  componentDidMount() {
    Dimensions.addEventListener('change', () => {
      this.width = Dimensions.get('window').width
    })
  }

  render() {
    return (
      <View style={{ width: this.width * 0.65 }}>
        <DelegationHeaderSegment />
      </View>
    )
  }
}
