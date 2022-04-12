import { Observer } from 'mobx-react'
import { Text, View } from 'native-base'
import { sharedColors } from '@utils/sharedColors'
import React, { FC } from 'react'
import fonts from '@utils/fonts'

export const SectionHeader: FC<{ title?: string }> = ({ title }) => {
  return (
    <Observer>
      {() => {
        return (
          <View>
            <Text
              style={{
                fontFamily: fonts.SFProTextRegular,
                fontSize: 13,
                color: sharedColors.borderColor,
                paddingHorizontal: 16,
                marginBottom: 6,
              }}
            >
              {title}
            </Text>
          </View>
        )
      }}
    </Observer>
  )
}
