import { sharedColors } from '@utils/sharedColors'
import { observer } from 'mobx-react'
import { View } from 'native-base'
import React, { Component } from 'react'
import { Image } from 'react-native'

const avatar = require('@assets/images/nikita.jpg')

@observer
export class Avatar extends Component {
  render() {
    return (
      <View
        style={{
          width: 104,
          height: 104,
          borderRadius: 52,
          borderColor: sharedColors.backgroundColor,
          borderWidth: 2,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 9,
        }}
      >
        <Image
          source={avatar}
          style={{
            width: 100,
            height: 100,
            resizeMode: 'cover',
            borderRadius: 50,
          }}
        />
      </View>
    )
  }
}
