import React, { Component } from 'react'
import { Icon } from 'native-base'
import { sharedColors } from '@utils/sharedColors'
import { observer } from 'mobx-react'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { View } from 'react-native'

export const addButtonStore = {
  add: () => {},
}

export let addButonNodeId: number

@observer
export class AddButton extends Component {
  render() {
    return (
      <TouchableOpacity
        onPress={() => {
          addButtonStore.add()
        }}
      >
        <View
          style={{
            opacity: 0.5,
            marginHorizontal: 12,
          }}
          onLayout={({ nativeEvent: { target } }: any) => {
            addButonNodeId = target
          }}
        >
          <Icon
            type="MaterialIcons"
            name="add"
            style={{ color: sharedColors.textColor }}
          />
        </View>
      </TouchableOpacity>
    )
  }
}
