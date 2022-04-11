import { Component } from 'react'
import { Text, View } from 'native-base'
import { observer } from 'mobx-react'
import { sharedColors } from '@utils/sharedColors'
import React from 'react'
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
