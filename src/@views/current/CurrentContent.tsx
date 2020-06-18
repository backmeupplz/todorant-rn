import { observer } from 'mobx-react'
import React, { Component } from 'react'
import { CurrentVM } from '@views/current/CurrentVM'
import { sharedSessionStore } from '@stores/SessionStore'
import { navigate } from '@utils/navigation'
import { sharedTodoStore } from '@stores/TodoStore'
import { Container, Text } from 'native-base'
import { sharedColors } from '@utils/sharedColors'
import { TodoCard } from '@components/TodoCard'
import { CardType } from '@components/TodoCard/CardType'
import ActionButton from 'react-native-action-button'
import { plusButtonAction } from '@utils/plusButtonAction'
import { NoTodosPlaceholder } from '@views/current/NoTodosPlaceholder'
import { AllDonePlaceholder } from '@views/current/AllDonePlaceholder'
import { HeaderScrollView } from '@components/HeaderScrollView'
import { translate } from '@utils/i18n'
import { sharedSettingsStore } from '@stores/SettingsStore'
import { SegmentedProgressView } from '@components/SegmentedProgressView'

@observer
export class CurrentContent extends Component {
  vm = new CurrentVM()

  componentDidMount() {
    setTimeout(() => {
      if (!sharedSessionStore.introMessageShown) {
        navigate('Intro')
      }
    }, 2 * 1000)
  }

  render() {
    const progress = sharedTodoStore.progress.count
      ? sharedTodoStore.progress.completed / sharedTodoStore.progress.count
      : 1
    return (
      <Container {...({ language: sharedSettingsStore.language } as any)}>
        <HeaderScrollView
          title={translate('current')}
          containerStyle={{ backgroundColor: sharedColors.backgroundColor }}
        >
          {!!sharedTodoStore.progress.count && (
            <SegmentedProgressView
              completed={sharedTodoStore.progress.completed}
              total={sharedTodoStore.progress.count}
            />
          )}
          {!!this.vm.currentTodo && (
            <TodoCard todo={this.vm.currentTodo} type={CardType.current} />
          )}
          {!!sharedTodoStore.progress.count &&
            sharedTodoStore.progress.count ===
              sharedTodoStore.progress.completed && <AllDonePlaceholder />}
          {!sharedTodoStore.progress.count && <NoTodosPlaceholder />}
        </HeaderScrollView>
        <ActionButton
          buttonColor={sharedColors.primaryColor}
          buttonTextStyle={{ color: sharedColors.invertedTextColor }}
          onPress={plusButtonAction}
          useNativeFeedback={true}
          fixNativeFeedbackRadius={true}
        />
      </Container>
    )
  }
}
