import React, { FC } from 'react'
import { View, Text } from 'native-base'
import { sharedColors } from '@utils/sharedColors'
import fonts from '@utils/fonts'

const SectionHeader: FC<{ title?: string }> = ({ title }) => {
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
}

export default SectionHeader
