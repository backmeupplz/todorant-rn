import { sharedColors } from '@utils/sharedColors'
import { translate } from '@utils/i18n'
import { observer } from 'mobx-react'
import { Icon, View } from 'native-base'
import React, { Component } from 'react'
import { Text } from 'react-native-animatable'
import { TouchableOpacity } from 'react-native-gesture-handler'

@observer
class Dot extends Component<{ active: boolean }> {
  radius = 8
  render() {
    return (
      <View
        style={{
          width: this.radius,
          height: this.radius,
          backgroundColor: sharedColors.textColor,
          opacity: this.props.active ? 1.0 : 0.2,
          margin: this.radius / 2,
          borderRadius: this.radius / 2,
        }}
      />
    )
  }
}

@observer
export class BottomControls extends Component<{
  count: number
  index: number
  indexChanged: (index: number) => void
  letsGoAction: () => void
}> {
  render() {
    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingLeft: 20,
          paddingRight: 20,
          backgroundColor: sharedColors.backgroundColor,
        }}
      >
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            top: 0,
            left: 0,
            right: 0,

            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {Array(this.props.count)
            .fill(0)
            .map((_, i) => (
              <Dot active={i === this.props.index} key={i} />
            ))}
        </View>
        {this.props.index > 0 ? (
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}
            onPress={() => {
              this.props.indexChanged(this.props.index - 1)
            }}
            disabled={this.props.index <= 0}
          >
            <Icon
              type="MaterialIcons"
              name="keyboard-arrow-left"
              style={{
                color: sharedColors.textColor,
                fontSize: 20,
              }}
            />
            <Text {...sharedColors.textExtraStyle}>{translate('back')}</Text>
          </TouchableOpacity>
        ) : (
          <View />
        )}
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}
          onPress={() => {
            if (this.props.index >= this.props.count - 1) {
              this.props.letsGoAction()
            } else {
              this.props.indexChanged(this.props.index + 1)
            }
          }}
        >
          <Text {...sharedColors.textExtraStyle}>
            {this.props.index >= this.props.count - 1
              ? translate('letsGo')
              : translate('next')}
          </Text>
          <Icon
            type="MaterialIcons"
            name="keyboard-arrow-right"
            style={{
              color: sharedColors.textColor,
              fontSize: 20,
            }}
          />
        </TouchableOpacity>
      </View>
    )
  }
}
