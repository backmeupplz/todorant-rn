import { Platform, View } from 'react-native'
import { TodoSectionType, sharedAppStateStore } from '@stores/AppStateStore'
import { observer } from 'mobx-react'
import { sharedColors } from '@utils/sharedColors'
import { sharedSettingsStore } from '@stores/SettingsStore'
import { translate } from '@utils/i18n'
import React, { Component } from 'react'
import SegmentedControl from '@react-native-community/segmented-control'
import fonts from '@utils/fonts'

export let planningHeaderNodeId: number

@observer
export class PlanningHeaderSegment extends Component {
  render() {
    return (
      <View
        onLayout={({ nativeEvent: { target } }: any) => {
          planningHeaderNodeId = target
        }}
      >
        <SegmentedControl
          values={[translate('planning'), translate('completed')]}
          selectedIndex={
            sharedAppStateStore.todoSection === TodoSectionType.planning ? 0 : 1
          }
          onChange={(event) => {
            sharedAppStateStore.changeLoading(false)
            const selectedSegmentIndex = event.nativeEvent.selectedSegmentIndex
            setTimeout(() => {
              if (selectedSegmentIndex === 0) {
                sharedAppStateStore.todoSection = TodoSectionType.planning
              } else {
                sharedAppStateStore.todoSection = TodoSectionType.completed
              }
            })
          }}
          appearance={sharedSettingsStore.isDark ? 'dark' : 'light'}
          backgroundColor={
            sharedColors.headerSegmentExtraStyle?.backgroundColor
          }
          tintColor={sharedColors.headerSegmentExtraStyle?.tintColor}
          fontStyle={sharedColors.headerSegmentExtraStyle?.fontStyle}
          activeFontStyle={
            sharedColors.headerSegmentExtraStyle?.activeFontStyle
          }
        />
      </View>
    )
  }
}
