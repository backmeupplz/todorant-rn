import { sharedSettingsStore } from '@stores/SettingsStore'
import { computed, makeObservable } from 'mobx'
import { StyleProp, ViewStyle } from 'react-native'
import { Platform } from 'react-native'
import { isDeviceSmall } from './deviceInfo'
import fonts from './fonts'
const ColorScheme = require('color-scheme')

export class ColorModeManager {
  constructor() {
    makeObservable(this)
    this.generateColorSchemes()
  }

  @computed get textColor() {
    return sharedSettingsStore.isDark ? '#f9f9f9' : '#060606'
  }
  @computed get invertedTextColor() {
    return !sharedSettingsStore.isDark ? '#f9f9f9' : '#060606'
  }
  @computed get primaryColor() {
    return sharedSettingsStore.isDark ? '#FF641A' : '#eb6a52'
  }
  @computed get backgroundColor() {
    return sharedSettingsStore.isDark ? '#19191A' : '#FCFCFE'
  }
  @computed get cardBackgroundColor() {
    return sharedSettingsStore.isDark ? '#1F1F1F' : '#FFFFFF'
  }
  @computed get borderColor() {
    return sharedSettingsStore.isDark
      ? 'rgba(243, 243, 246, 0.3)'
      : 'rgba(0, 0, 0, 0.3)'
  }
  @computed get dividerColor() {
    return sharedSettingsStore.isDark ? 'rgba(234, 237, 241, 0.2)' : '#D7D8D9'
  }
  @computed get headerExtraStyle() {
    return {
      headerStyle: {
        backgroundColor: this.backgroundColor,
        shadowColor: sharedSettingsStore.isDark ? this.borderColor : undefined,
      },
      headerTitleStyle: {
        color: this.textColor,
      },
      headerTintColor: this.textColor,
    }
  }
  @computed get headerSegmentExtraStyle() {
    return Platform.OS === 'android'
      ? {
          backgroundColor: sharedSettingsStore.isDark ? '#2f2f33' : undefined,
          tintColor: sharedSettingsStore.isDark ? '#68686d' : '#6e7185',
          fontStyle: {
            fontFamily: fonts.SFProRoundedRegular,
            color: sharedSettingsStore.isDark ? undefined : this.textColor,
          },
          activeFontStyle: {
            fontFamily: fonts.SFProRoundedRegular,
            color: sharedSettingsStore.isDark
              ? undefined
              : this.invertedTextColor,
            fontSize: isDeviceSmall() ? 12 : undefined,
          },
        }
      : undefined
  }
  @computed get textExtraStyle() {
    return {
      style: {
        color: this.textColor,
      },
    }
  }
  @computed get regularTextExtraStyle() {
    return {
      style: {
        color: this.textColor,
        fontFamily: fonts.SFProTextRegular,
      },
    }
  }
  @computed get listItemExtraStyle() {
    return {
      style: {
        borderColor: sharedColors.placeholderColor,
        justifyContent: 'space-between',
      },
      underlayColor: 'rgba(0,0,0,0.2)',
    } as { style: StyleProp<ViewStyle>; underlayColor: string }
  }
  @computed get iconExtraStyle() {
    return {
      style: {
        color: this.primaryColor,
      },
    }
  }
  @computed get defaultIconColor() {
    return sharedSettingsStore.isDark
      ? 'rgb(51, 102, 255)'
      : 'rgb(51, 102, 255)'
  }
  @computed get destructIconColor() {
    return sharedSettingsStore.isDark ? '#E64646' : '#E64646'
  }
  @computed get successIconColor() {
    return sharedSettingsStore.isDark ? '#4BB34B' : '#4BB34B'
  }
  @computed get placeholderColor() {
    return 'grey'
  }
  @computed get specialSeparatorColor() {
    return sharedSettingsStore.isDark ? 'steelblue' : 'lightsteelblue'
  }
  @computed get oldTodoBackground() {
    return sharedSettingsStore.isDark ? 'maroon' : 'lavenderblush'
  }
  @computed get done() {
    return sharedSettingsStore.isDark ? 'forestgreen' : 'limegreen'
  }
  @computed get delete() {
    return sharedSettingsStore.isDark ? 'firebrick' : 'orangered'
  }

  @computed get progressBarBackground() {
    return sharedSettingsStore.isDark
      ? 'rgba(249, 249, 249, 0.2)'
      : 'rgba(6, 6, 6, 0.2)'
  }

  colorSchemes = [] as string[][]

  generateColorSchemes() {
    for (let i = 0; i < 360; i += 15) {
      const scheme = new ColorScheme()
      scheme.from_hue(i).scheme('mono').variation('soft')
      this.colorSchemes.push(scheme.colors().map((c: any) => `#${c}`))
    }
  }
}

export const sharedColors = new ColorModeManager()
