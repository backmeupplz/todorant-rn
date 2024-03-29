import { View } from 'react-native'
import React from 'react'
import Svg, { Path } from 'react-native-svg'

export let BottomTabPlanningButton: number

function SvgComponent(props: any) {
  return (
    <View
      onLayout={({ nativeEvent: { target } }: any) => {
        BottomTabPlanningButton = target
      }}
    >
      <Svg width={28} height={28} viewBox="0 0 28 28" fill="none" {...props}>
        <Path
          opacity={0.4}
          d="M19.365 5.634h-3.433a2.834 2.834 0 01-2.21-1.035l-1.13-1.563A2.761 2.761 0 0010.391 2H7.965C3.608 2 2 4.557 2 8.905v4.7c-.005.517 23.328.516 23.33 0V12.24c.02-4.348-1.546-6.605-5.965-6.605z"
          fill="#FF641A"
        />
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M23.97 7.3c.374.437.663.94.851 1.481a9.97 9.97 0 01.509 3.458v6.128c-.002.517-.04 1.032-.114 1.543a6.99 6.99 0 01-.934 2.546 5.175 5.175 0 01-.788 1.036 7 7 0 01-5.094 1.832H8.92a7.031 7.031 0 01-5.105-1.832 5.179 5.179 0 01-.778-1.036 6.804 6.804 0 01-.913-2.546A9.568 9.568 0 012 18.367V12.24c0-.512.027-1.024.083-1.532.012-.09.03-.178.046-.264.03-.145.058-.288.058-.43.105-.614.297-1.21.57-1.77.81-1.73 2.47-2.609 5.187-2.609h11.41a6.087 6.087 0 014.233 1.284c.138.117.267.245.384.383zM7.8 17.799H19.562a.966.966 0 001.006-.932.868.868 0 00-.207-.62.913.913 0 00-.726-.374H7.799a.964.964 0 100 1.926z"
          fill="#FF641A"
        />
      </Svg>
    </View>
  )
}

export default SvgComponent
