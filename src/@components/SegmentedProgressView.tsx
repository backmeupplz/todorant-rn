import { Observer } from 'mobx-react'
import { Text, View } from 'native-base'
import { sharedColors } from '@utils/sharedColors'
import React, { FC, memo } from 'react'
import fonts from '@utils/fonts'

export const SegmentedProgressView: FC<{
  completed: number
  total: number
}> = memo((props) => {
  return (
    <Observer>
      {() => {
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
              {props.completed}
            </Text>
            <View
              style={{
                height: 4,
                flexGrow: 1,
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              {props.total <= 20 ? (
                Array.from(Array(props.total).keys()).map((i) => (
                  <View
                    key={i}
                    style={{
                      marginHorizontal: 4,
                      height: '100%',
                      borderRadius: 10,
                      backgroundColor:
                        i < props.completed
                          ? sharedColors.primaryColor
                          : sharedColors.textColor,
                      flex: 1,
                      opacity: i < props.completed ? 1.0 : 0.2,
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
                      width: `${(props.completed / props.total) * 100}%`,
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
              {props.total}
            </Text>
          </View>
        )
      }}
    </Observer>
  )
})
