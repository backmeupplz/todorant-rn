import React, { Component } from 'react'
import { sharedAppStateStore, TodoSectionType } from '@stores/AppStateStore'
import { translate } from '@utils/i18n'
import { observer } from 'mobx-react'
import SegmentedControl from '@react-native-community/segmented-control'
import { sharedColors } from '@utils/sharedColors'
import { Platform, View } from 'react-native'
import fonts from '@utils/fonts'
import { sharedSettingsStore } from '@stores/SettingsStore'

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
