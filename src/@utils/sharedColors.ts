import { sharedSettingsStore, ColorMode } from '@stores/SettingsStore'
import { initialMode, eventEmitter } from 'react-native-dark-mode'
import { observable, computed } from 'mobx'
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
    return this.isDark ? '#f9f9f9' : '#eb6a52'
  }
  @computed get backgroundColor() {
    return this.isDark ? '#343434' : '#fff8f7'
  }
  @computed get borderColor() {
    return this.isDark ? '#919191' : '#919191'
  }
  @computed get headerExtraStyle() {
    return {
      headerStyle: {
        backgroundColor: this.backgroundColor,
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
  @computed get iconExtraStyle() {
    return {
      style: {
        color: this.primaryColor,
      },
    }
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

  colorSchemes = [] as string[][]

  generateColorSchemes() {
    for (let i = 0; i < 360; i += 20) {
      const scheme = new ColorScheme()
      scheme.from_hue(i).scheme('mono').variation('soft')
      this.colorSchemes.push(scheme.colors().map((c: any) => `#${c}`))
    }
  }
}

export const sharedColors = new ColorModeManager()
