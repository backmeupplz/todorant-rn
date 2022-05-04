import { H1, Text, View } from 'native-base'
import { Observer } from 'mobx-react'
import { sharedColors } from '@utils/sharedColors'
import { translate } from '@utils/i18n'
import React, { memo } from 'react'

export const NoTodosPlaceholder = memo(() => {
  return (
    <Observer>
      {() => {
        return (
          <View
            style={{
              flex: 1,
              flexDirection: 'column',
              alignItems: 'center',
              margin: 12,
              marginTop: 32,
            }}
          >
            <H1
              style={{
                color: sharedColors.textColor,
                marginHorizontal: 24,
                marginBottom: 12,
              }}
            >
              🐝
            </H1>
            <H1
              style={{
                color: sharedColors.textColor,
                opacity: 0.9,
                marginHorizontal: 24,
                marginBottom: 16,
              }}
            >
              {translate('noTodosTitle')}
            </H1>
            <Text
              style={{
                textAlign: 'center',
                color: sharedColors.textColor,
                opacity: 0.8,
                marginHorizontal: 24,
              }}
            >
              {translate('noTodosText')}
            </Text>
          </View>
        )
      }}
    </Observer>
  )
})
