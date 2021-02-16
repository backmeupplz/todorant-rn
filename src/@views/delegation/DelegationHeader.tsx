import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { View } from 'native-base'
import { DelegationHeaderSegment } from './DelegationHeaderSegment'
import { Dimensions } from 'react-native'
import { makeObservable, observable } from 'mobx'

@observer
export class DelegationHeader extends Component {
  @observable width = Dimensions.get('window').width

  componentWillMount() {
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
