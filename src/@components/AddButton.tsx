import React, { Component } from 'react'
import { Icon } from 'native-base'
import { sharedColors } from '@utils/sharedColors'
import { observer } from 'mobx-react'
import { TouchableOpacity } from 'react-native-gesture-handler'

export const addButtonStore = {
  add: () => {},
}

export let AddButonNodeId: number

@observer
export class AddButton extends Component {
  render() {
    return (
      <TouchableOpacity
        onLayout={(e) => {
          AddButonNodeId = e.nativeEvent.target
        }}
        onPress={() => {
          addButtonStore.add()
        }}
      >
        <Icon
          type="MaterialIcons"
          name="add"
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
