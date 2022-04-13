import { Observer } from 'mobx-react'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { sharedColors } from '@utils/sharedColors'
import CustomIcon from '@components/CustomIcon'
import React, { FC, memo } from 'react'

// TODO: figure out how callbacks affect on memo

export const IconButton: FC<{
  onPress: () => void
  name: string
  color?: string
  fullColor?: boolean
  size?: number
  disabled?: boolean
}> = memo((props) => {
  return (
    <Observer>
      {() => {
        return (
          <TouchableOpacity onPress={props.onPress} disabled={props.disabled}>
            <CustomIcon
              name={props.name}
              size={props.size || 28}
              style={{
                color: !props.disabled
                  ? props.color || sharedColors.defaultIconColor
                  : 'gray',
                opacity: props.fullColor ? 1.0 : 0.8,
                marginHorizontal: 6,
              }}
            />
          </TouchableOpacity>
        )
      }}
    </Observer>
  )
})
