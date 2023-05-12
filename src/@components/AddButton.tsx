import { Icon } from 'native-base'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { View } from 'react-native'
import { observer } from 'mobx-react'
import { sharedColors } from '@utils/sharedColors'
import React from 'react'

export const addButtonStore = {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  add: () => {},
}

export let addButonNodeId: number

export const AddButton = observer(() => {
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
        onLayout={({ nativeEvent: { target } }) => {
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
})
