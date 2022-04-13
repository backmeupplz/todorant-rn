import { Icon } from 'native-base'
import { Observer } from 'mobx-react'
import { sharedColors } from '@utils/sharedColors'
import React, { FC, memo } from 'react'

export const CheckOrCross: FC<{ ok: boolean }> = memo(({ ok }) => {
  return (
    <Observer>
      {() => {
        return (
          <Icon
            type="MaterialIcons"
            name={ok ? 'check' : 'close'}
            style={{
              color: ok
                ? sharedColors.successIconColor
                : sharedColors.destructIconColor,
            }}
          />
        )
      }}
    </Observer>
  )
})
