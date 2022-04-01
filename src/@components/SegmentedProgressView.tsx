import { Component } from 'react'
import { Text, View } from 'native-base'
import { observer } from 'mobx-react'
import { sharedColors } from '@utils/sharedColors'
import fonts from '@utils/fonts'

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
            fontFamily: fonts.SFProRoundedRegular,
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
          {this.props.total <= 20 ? (
            Array.from(Array(this.props.total).keys()).map((i) => (
              <View
                key={i}
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
            ))
          ) : (
            <View
              style={{
                marginHorizontal: 4,
                height: '100%',
                borderRadius: 10,
                flex: 1,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                  backgroundColor: sharedColors.textColor,
                  opacity: 0.2,
                }}
              />
              <View
                style={{
                  backgroundColor: sharedColors.primaryColor,
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: `${(this.props.completed / this.props.total) * 100}%`,
                  height: '100%',
                  borderRadius: 10,
                }}
              ></View>
            </View>
          )}
        </View>
        <Text
          style={{
            color: sharedColors.primaryColor,
            fontFamily: fonts.SFProRoundedRegular,
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
