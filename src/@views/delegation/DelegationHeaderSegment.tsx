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

@observer
export class DelegationHeaderSegment extends Component {
  render() {
    return (
      <SegmentedControl
        values={[translate('delegate.toMe'), translate('delegate.byMe')]}
        selectedIndex={
          sharedDelegateStateStore.todoSection === DelegateSectionType.toMe
            ? 0
            : 1
        }
        onChange={(event) => {
          if (event.nativeEvent.selectedSegmentIndex === 0) {
            sharedDelegateStateStore.todoSection = DelegateSectionType.toMe
          } else {
            sharedDelegateStateStore.todoSection = DelegateSectionType.byMe
          }
        }}
        appearance={sharedColors.isDark ? 'dark' : 'light'}
        backgroundColor={
          sharedColors.isDark && Platform.OS === 'android'
            ? '#2f2f33'
            : undefined
        }
        tintColor={
          Platform.OS === 'android'
            ? sharedColors.isDark
              ? '#68686d'
              : '#6e7185'
            : undefined
        }
        fontStyle={
          Platform.OS === 'android'
            ? {
                fontFamily: fonts.SFProRoundedRegular,
                color: sharedColors.isDark ? undefined : sharedColors.textColor,
              }
            : undefined
        }
        activeFontStyle={
          Platform.OS === 'android'
            ? {
                fontFamily: fonts.SFProRoundedBold,
                color: sharedColors.isDark
                  ? undefined
                  : sharedColors.invertedTextColor,
              }
            : undefined
        }
      />
    )
  }
}
