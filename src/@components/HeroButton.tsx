import { Platform } from 'react-native'
import { ProgressView } from '@components/ProgressView'
import { Text } from 'native-base'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { navigate } from '@utils/navigation'
import { observer } from 'mobx-react'
import { sharedHeroStore } from '@stores/HeroStore'
import { sharedSettingsStore } from '@stores/SettingsStore'
import React, { Component } from 'react'
import fonts from '@utils/fonts'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const shortNum = require('number-shortener')

@observer
export class HeroButton extends Component {
  render() {
    const tintColor =
      sharedHeroStore.rankColor[sharedSettingsStore.isDark ? 2 : 3]
    const trackColor =
      sharedHeroStore.rankColor[sharedSettingsStore.isDark ? 3 : 2]

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
            fontFamily: fonts.SFProRoundedBold,
            fontSize: 22,
            marginBottom: Platform.OS === 'android' ? -5 : undefined,
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
