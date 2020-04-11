import { observer } from 'mobx-react'
import React, { Component } from 'react'
import { CurrentVM } from '@views/current/CurrentVM'
import { sharedSessionStore } from '@stores/SessionStore'
import { navigate } from '@utils/navigation'
import { sharedTodoStore } from '@stores/TodoStore'
import { Container, Content, View, Text } from 'native-base'
import { sharedSettingsStore } from '@stores/SettingsStore'
import { sharedColors } from '@utils/sharedColors'
import { ProgressBar } from '@components/ProgressBar'
import { TodoCard } from '@components/TodoCard'
import { CardType } from '@components/TodoCard/CardType'
import ActionButton from 'react-native-action-button'
import { plusButtonAction } from '@utils/plusButtonAction'
import { NoTodosPlaceholder } from './NoTodosPlaceholder'
import { AllDonePlaceholder } from './AllDonePlaceholder'

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
        <Content style={{ backgroundColor: sharedColors.backgroundColor }}>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              margin: 12,
            }}
          >
            <ProgressBar progress={progress} />
            <Text {...sharedColors.textExtraStyle}>
              {`${sharedTodoStore.progress.completed}/${sharedTodoStore.progress.count}`}
            </Text>
          </View>
          {!!this.vm.currentTodo && (
            <TodoCard todo={this.vm.currentTodo} type={CardType.current} />
          )}
          {!!sharedTodoStore.progress.count &&
            sharedTodoStore.progress.count ===
              sharedTodoStore.progress.completed && <AllDonePlaceholder />}
          {!sharedTodoStore.progress.count && <NoTodosPlaceholder />}
        </Content>
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
