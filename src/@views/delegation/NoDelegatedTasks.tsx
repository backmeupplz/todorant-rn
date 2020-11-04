import React, { Component } from 'react'
import { View, H1, Text } from 'native-base'
import { observer } from 'mobx-react'
import { sharedColors } from '@utils/sharedColors'
import { translate } from '@utils/i18n'
import { sharedAppStateStore } from '@stores/AppStateStore'
import {
  sharedDelegateStateStore,
  DelegateSectionType,
} from '@stores/DelegateScreenStateStore'

@observer
export class NoDelegatedTasks extends Component {
  render() {
    // Hack to make this reactive
    let languageTag = sharedAppStateStore.languageTag
    languageTag = `${languageTag}`

    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          alignItems: 'center',
          marginTop: 30,
        }}
      >
        <H1
          style={{
            color: sharedColors.textColor,
            marginHorizontal: 24,
            marginBottom: 12,
          }}
        >
          🏅
        </H1>
        <Text
          style={{
            textAlign: 'center',
            color: sharedColors.textColor,
            opacity: 0.8,
            marginHorizontal: 24,
          }}
        >
          {sharedDelegateStateStore.todoSection === DelegateSectionType.toMe
            ? translate('delegate.noDelegatedTasks')
            : translate('delegate.noDelegatedTasksTo')}
        </Text>
      </View>
    )
  }
}
