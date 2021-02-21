import { sharedColors } from '@utils/sharedColors'
import { observer } from 'mobx-react'
import { Text } from 'native-base'
import React, { Component } from 'react'
import { View } from 'react-native'
import { Avatar } from '@views/onboarding/Avatar'
import { OnboardingButton } from '@views/onboarding/OnboardingButton'

@observer
export class MessageBox extends Component {
  render() {
    return (
      <View style={{ alignItems: 'center' }}>
        <Avatar />
        <View
          style={{
            backgroundColor: sharedColors.backgroundColor,
            padding: 18,
            borderRadius: 28,
            width: '100%',
            marginVertical: 9,
          }}
        >
          <Text {...sharedColors.textExtraStyle}>
            Hey there! It's Nikita, I created Todorant.
          </Text>
          <Text style={{ ...sharedColors.textExtraStyle.style, marginTop: 12 }}>
            Users understand Todorant better when I show them how to use it.
            Would you like me to show you the correct way of using Todorant to
            achieve insane levels of productivity?
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'column',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          <OnboardingButton preferred title="Sure thing!" />
          <OnboardingButton title="Nah, I don't need manuals" />
        </View>
      </View>
    )
  }
}
