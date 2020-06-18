import React, { Component } from 'react'
import { Text } from 'native-base'
import { navigate } from '@utils/navigation'
import { sharedColors } from '@utils/sharedColors'
import { sharedHeroStore } from '@stores/HeroStore'
import { observer } from 'mobx-react'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { ProgressView } from './ProgressView'
const shortNum = require('number-shortener')

@observer
export class HeroButton extends Component {
  render() {
    const tintColor = sharedHeroStore.rankColor[sharedColors.isDark ? 2 : 3]
    const trackColor = sharedHeroStore.rankColor[sharedColors.isDark ? 3 : 2]

    return (
      <TouchableOpacity
        onPress={() => {
          navigate('HeroProfile')
        }}
        style={{
          flexDirection: 'column',
          minWidth: 30,
          marginRight: 16,
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            color: tintColor,
            fontFamily: 'SF-Pro-Rounded-Bold',
            fontSize: 22,
            marginBottom: -5,
          }}
        >
          {shortNum(sharedHeroStore.points)}
        </Text>
        <ProgressView
          progress={sharedHeroStore.progress}
          tintColor={tintColor}
          trackColor={trackColor}
        />
      </TouchableOpacity>
    )
  }
}
