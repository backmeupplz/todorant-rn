import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { View, Text } from 'native-base'
import { sharedColors } from '@utils/sharedColors'
import fonts from '@utils/fonts'

@observer
export class SectionHeader extends Component<{ title: string }> {
  render() {
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
          {this.props.title}
        </Text>
      </View>
    )
  }
}