import React, { Component } from 'react'
import CustomIcon from '@components/CustomIcon'
import { sharedColors } from '@utils/sharedColors'
import { observer } from 'mobx-react'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { View } from 'native-base'

@observer
export class TableItem extends Component<{
  onPress?: () => void
}> {
  render() {
    return (
      <TouchableOpacity
        onPress={this.props.onPress}
        disabled={!this.props.onPress}
        style={{
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 16,
          marginVertical: 8,
        }}
      >
        <View style={{ flexDirection: 'row' }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              flex: 1,
            }}
          >
            {this.props.children}
          </View>
          {!!this.props.onPress && (
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
              <CustomIcon
                name="chevron_right_outline_28"
                color={sharedColors.borderColor}
                size={24}
              />
            </View>
          )}
        </View>
      </TouchableOpacity>
    )
  }
}
