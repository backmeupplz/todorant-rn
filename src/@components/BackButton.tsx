import React, { Component } from 'react'
import { Icon } from 'native-base'
import { sharedColors } from '@utils/sharedColors'
import { observer } from 'mobx-react'
import { TouchableOpacity } from 'react-native-gesture-handler'

export const backButtonStore = {
  back: () => {},
}

@observer
export class BackButton extends Component {
  render() {
    return (
      <TouchableOpacity
        onPress={() => {
          backButtonStore.back()
        }}
      >
        <Icon
          type="MaterialIcons"
          name="arrow-back"
          style={{
            color: sharedColors.textColor,
            opacity: 0.5,
            marginHorizontal: 12,
          }}
        />
      </TouchableOpacity>
    )
  }
}