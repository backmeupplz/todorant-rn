import React, { Component } from 'react'
import {
  sharedDelegateStateStore,
  DelegateSectionType,
} from '@stores/DelegateScreenStateStore'
import { translate } from '@utils/i18n'
import { observer } from 'mobx-react'
import SegmentedControl from '@react-native-community/segmented-control'
import { sharedColors } from '@utils/sharedColors'
import { Platform } from 'react-native'
import fonts from '@utils/fonts'
import { sharedSettingsStore } from '@stores/SettingsStore'

@observer
export class DelegationHeaderSegment extends Component {
  render() {
    return (
      <SegmentedControl
        values={[translate('delegate.ToMe'), translate('delegate.ByMe')]}
        selectedIndex={
          sharedDelegateStateStore.todoSection === DelegateSectionType.ToMe
            ? 0
            : 1
        }
        onChange={(event) => {
          if (event.nativeEvent.selectedSegmentIndex === 0) {
            sharedDelegateStateStore.todoSection = DelegateSectionType.ToMe
          } else {
            sharedDelegateStateStore.todoSection = DelegateSectionType.ByMe
          }
        }}
        appearance={sharedSettingsStore.isDark ? 'dark' : 'light'}
        backgroundColor={sharedColors.headerSegmentExtraStyle?.backgroundColor}
        tintColor={sharedColors.headerSegmentExtraStyle?.tintColor}
        fontStyle={sharedColors.headerSegmentExtraStyle?.fontStyle}
        activeFontStyle={sharedColors.headerSegmentExtraStyle?.activeFontStyle}
      />
    )
  }
}
