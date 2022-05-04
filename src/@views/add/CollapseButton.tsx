import { Icon } from 'native-base'
import { Observer } from 'mobx-react'
import { TodoVM } from '@views/add/TodoVM'
import { TouchableOpacity } from 'react-native'
import { sharedColors } from '@utils/sharedColors'
import React, { FC, memo } from 'react'

export const CollapseButton: FC<{ vm: TodoVM }> = memo(({ vm }) => {
  return (
    <Observer>
      {() => {
        return (
          <TouchableOpacity
            onPress={() => {
              vm.collapsed = !vm.collapsed
            }}
          >
            <Icon
              type="MaterialIcons"
              name={vm.collapsed ? 'keyboard-arrow-down' : 'keyboard-arrow-up'}
              style={{
                color:
                  !vm.collapsed || vm.isValid
                    ? sharedColors.textColor
                    : 'tomato',
                fontSize: 25,
                padding: 5,
              }}
            />
          </TouchableOpacity>
        )
      }}
    </Observer>
  )
})
