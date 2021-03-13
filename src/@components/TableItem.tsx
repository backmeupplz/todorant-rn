import React, { Component } from 'react'
import CustomIcon from '@components/CustomIcon'
import { sharedColors } from '@utils/sharedColors'
import { observer } from 'mobx-react'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { View } from 'native-base'
import { LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native'

@observer
export class TableItem extends Component<{
  onPress?: () => void
  onLongPress?: () => void
  onLayout?: (layout: LayoutChangeEvent) => void
}> {
  renderContent() {
    return (
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
    )
  }

  containerStyle = {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 8,
  } as StyleProp<ViewStyle>

  render() {
    return this.props.onPress ? (
      <TouchableOpacity
        onLayout={this.props.onLayout}
        onPress={this.props.onPress}
        onLongPress={this.props.onLongPress}
        disabled={!this.props.onPress}
        style={this.containerStyle}
      >
        {this.renderContent()}
      </TouchableOpacity>
    ) : (
      <View style={this.containerStyle}>{this.renderContent()}</View>
    )
  }
}
