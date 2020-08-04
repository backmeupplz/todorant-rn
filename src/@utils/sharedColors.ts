import { sharedSettingsStore, ColorMode } from '@stores/SettingsStore'
import { initialMode, eventEmitter } from 'react-native-dark-mode'
import { observable, computed } from 'mobx'
import { StyleProp, ViewStyle } from 'react-native'
import { updateAndroidNavigationBarColor } from './androidNavigationBar'
import fonts from './fonts'
const ColorScheme = require('color-scheme')

export class ColorModeManager {
  @observable mode = initialMode
  @computed get isDark() {
    return sharedSettingsStore.colorMode === ColorMode.auto
      ? this.mode === 'dark'
      : sharedSettingsStore.colorMode === ColorMode.dark
  }

  constructor() {
    eventEmitter.on('currentModeChanged', (newMode) => {
      this.mode = newMode
      updateAndroidNavigationBarColor()
    })
    this.generateColorSchemes()
  }

  @computed get textColor() {
    return this.isDark ? '#f9f9f9' : '#060606'
  }
  @computed get invertedTextColor() {
    return !this.isDark ? '#f9f9f9' : '#060606'
  }
  @computed get primaryColor() {
    return this.isDark ? '#FF641A' : '#eb6a52'
  }
  @computed get backgroundColor() {
    return this.isDark ? '#19191A' : '#FCFCFE'
  }
  @computed get cardBackgroundColor() {
    return this.isDark ? '#1F1F1F' : '#FFFFFF'
  }
  @computed get borderColor() {
    return this.isDark ? 'rgba(243, 243, 246, 0.3)' : 'rgba(0, 0, 0, 0.3)'
  }
  @computed get headerExtraStyle() {
    return {
      headerStyle: {
        backgroundColor: this.backgroundColor,
        shadowColor: this.isDark ? this.borderColor : undefined,
      },
      headerTitleStyle: {
        color: this.textColor,
      },
      headerTintColor: this.textColor,
    }
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
    return this.isDark ? 'rgb(51, 102, 255)' : 'rgb(51, 102, 255)'
  }
  @computed get destructIconColor() {
    return this.isDark ? '#E64646' : '#E64646'
  }
  @computed get successIconColor() {
    return this.isDark ? '#4BB34B' : '#4BB34B'
  }
  @computed get placeholderColor() {
    return 'grey'
  }
  @computed get specialSeparatorColor() {
    return this.isDark ? 'steelblue' : 'lightsteelblue'
  }
  @computed get oldTodoBackground() {
    return this.isDark ? 'maroon' : 'lavenderblush'
  }
  @computed get done() {
    return this.isDark ? 'forestgreen' : 'limegreen'
  }
  @computed get delete() {
    return this.isDark ? 'firebrick' : 'orangered'
  }

  @computed get progressBarBackground() {
    return this.isDark ? 'rgba(249, 249, 249, 0.2)' : 'rgba(6, 6, 6, 0.2)'
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
