import { Icon, View } from 'native-base'
import { MelonTodo } from '@models/MelonTodo'
import { observer } from 'mobx-react'
import { sharedColors } from '@utils/sharedColors'
import React from 'react'

export const TodoCardBackground = observer(
  ({ direction, todo }: { direction: string; todo: MelonTodo }) => {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'flex-start',
          alignItems: direction === 'left' ? 'flex-start' : 'flex-end',
          paddingHorizontal: 20,
          marginTop: 20,
        }}
      >
        <Icon
          type="MaterialIcons"
          name={direction === 'left' ? 'done' : 'delete'}
          {...sharedColors.iconExtraStyle}
          style={{ color: 'white' }}
        />
      </View>
    )
  }
)
