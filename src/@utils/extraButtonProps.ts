import { ColorModeManager } from '@utils/sharedColors'
import { Platform } from 'react-native'

export const extraButtonProps = (sharedColors: ColorModeManager) => ({
  rounded: Platform.OS === 'android' ? true : undefined,
  style:
    Platform.OS === 'android'
      ? {
          backgroundColor:
            Platform.OS === 'android'
              ? sharedColors.backgroundColor
              : undefined,
          elevation: 0,
          overflow: 'hidden',
        }
      : undefined,
  androidRippleColor:
    Platform.OS === 'android' ? sharedColors.primaryColor : undefined,
  transparent: Platform.OS === 'ios' ? true : undefined,
})
