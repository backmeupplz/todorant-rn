import { Component } from 'react'
import {
  DelegateSectionType,
  sharedDelegateStateStore,
} from '@stores/DelegateScreenStateStore'
import { H1, Text, View } from 'native-base'
import { observer } from 'mobx-react'
import { sharedColors } from '@utils/sharedColors'
import { translate } from '@utils/i18n'

@observer
export class NoDelegatedTasks extends Component {
  render() {
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
          {sharedDelegateStateStore.todoSection === DelegateSectionType.ToMe
            ? translate('delegate.noDelegatedTasks')
            : translate('delegate.noDelegatedTasksTo')}
        </Text>
      </View>
    )
  }
}
