import React, { Component } from 'react'
import { View, Text } from 'native-base'
import { sharedColors } from '@utils/sharedColors'
import { observer } from 'mobx-react'

@observer
export class SegmentedProgressView extends Component<{
  completed: number
  total: number
}> {
  render() {
    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          marginVertical: 16,
        }}
      >
        <Text
          style={{
            color: sharedColors.primaryColor,
            fontFamily: 'SF-Pro-Rounded-Regular',
            fontSize: 22,
            marginHorizontal: 16,
          }}
        >
          {this.props.completed}
        </Text>
        <View
          style={{
            height: 4,
            flexGrow: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          {Array.from(Array(this.props.total).keys()).map((i) => (
            <View
              style={{
                marginHorizontal: 4,
                height: '100%',
                borderRadius: 10,
                backgroundColor:
                  i < this.props.completed
                    ? sharedColors.primaryColor
                    : sharedColors.textColor,
                flex: 1,
                opacity: i < this.props.completed ? 1.0 : 0.2,
              }}
            />
          ))}
        </View>
        <Text
          style={{
            color: sharedColors.primaryColor,
            fontFamily: 'SF-Pro-Rounded-Regular',
            fontSize: 22,
            marginHorizontal: 16,
          }}
        >
          {this.props.total}
        </Text>
      </View>
    )
  }
}
