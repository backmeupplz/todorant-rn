import { Component } from 'react'
import {
  DelegateSectionType,
  sharedDelegateStateStore,
} from '@stores/DelegateScreenStateStore'
import { observer } from 'mobx-react'
import { sharedColors } from '@utils/sharedColors'
import { sharedSettingsStore } from '@stores/SettingsStore'
import { translate } from '@utils/i18n'
import React from 'react'
import SegmentedControl from '@react-native-community/segmented-control'

@observer
export class DelegationHeaderSegment extends Component {
  render() {
    return (
      <SegmentedControl
        values={[
          translate('delegate.ToMe'),
          translate('delegate.ByMe'),
          translate('completed'),
        ]}
        selectedIndex={sharedDelegateStateStore.todoSectionIndex}
        onChange={({ nativeEvent: { selectedSegmentIndex } }) => {
          if (selectedSegmentIndex === 0) {
            sharedDelegateStateStore.todoSection = DelegateSectionType.ToMe
          } else if (selectedSegmentIndex === 1) {
            sharedDelegateStateStore.todoSection = DelegateSectionType.ByMe
          } else {
            sharedDelegateStateStore.todoSection = DelegateSectionType.Completed
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
