import React, { Component } from 'react'
import { sharedAppStateStore, TodoSectionType } from '@stores/AppStateStore'
import { translate } from '@utils/i18n'
import { observer } from 'mobx-react'
import SegmentedControl from '@react-native-community/segmented-control'
import { sharedColors } from '@utils/sharedColors'
import { Platform, SnapshotViewIOS, View } from 'react-native'
import fonts from '@utils/fonts'
import { Spinner } from '@components/Spinner'

@observer
export class PlanningHeaderSegment extends Component {
  render() {
    return (
      <View>
        <SegmentedControl
          values={[translate('planning'), translate('completed')]}
          selectedIndex={
            sharedAppStateStore.todoSection === TodoSectionType.planning ? 0 : 1
          }
          onChange={(event) => {
            sharedAppStateStore.changeLoading(true)
            const selectedSegmentIndex = event.nativeEvent.selectedSegmentIndex
            setTimeout(() => {
              if (selectedSegmentIndex === 0) {
                sharedAppStateStore.todoSection = TodoSectionType.planning
              } else {
                sharedAppStateStore.todoSection = TodoSectionType.completed
              }
            })
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
                  color: sharedColors.isDark
                    ? undefined
                    : sharedColors.textColor,
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
      </View>
    )
  }
}
