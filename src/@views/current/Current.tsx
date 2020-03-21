import React, { Component } from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { Container, Content, View, Text, H1 } from 'native-base'
import { TodoCard, CardType } from '../../@components/TodoCard'
import ActionButton from 'react-native-action-button'
import { navigate } from '../../@utils/navigation'
import { AddTodo } from '../add/AddTodo'
import { sharedTodoStore } from '@stores/TodoStore'
import { observer } from 'mobx-react'
import { computed } from 'mobx'
import { Platform, ProgressViewIOS, ProgressBarAndroid } from 'react-native'
import { sharedSessionStore } from '@stores/SessionStore'
import { Login } from '@views/settings/Login'
import { Paywall } from '@views/settings/Paywall'
import { translate } from '@utils/i18n'
import { sharedColors } from '@utils/sharedColors'

const Stack = createStackNavigator()

class CurrentVM {
  @computed get currentTodo() {
    return sharedTodoStore.currentTodo
  }
}

class ProgressBar extends Component<{ progress: number }> {
  render() {
    return Platform.OS === 'ios' ? (
      <ProgressViewIOS
        progress={this.props.progress}
        style={{ flex: 1, marginEnd: 12 }}
      />
    ) : (
      <ProgressBarAndroid
        styleAttr="Horizontal"
        indeterminate={false}
        progress={this.props.progress}
        style={{ flex: 1, marginEnd: 12 }}
        color={sharedColors.primaryColor}
      />
    )
  }
}

@observer
class CurrentContent extends Component {
  vm = new CurrentVM()

  render() {
    const progress = sharedTodoStore.progress.count
      ? sharedTodoStore.progress.completed / sharedTodoStore.progress.count
      : 1
    return (
      <Container>
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
              sharedTodoStore.progress.completed && (
              <View
                style={{
                  flex: 1,
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <H1 {...sharedColors.textExtraStyle}>🎉</H1>
                <H1 {...sharedColors.textExtraStyle}>
                  {translate('allDoneTitle')}
                </H1>
                <Text
                  style={{ textAlign: 'center', color: sharedColors.textColor }}
                >
                  {translate('allDoneText')}
                </Text>
              </View>
            )}
          {!sharedTodoStore.progress.count && (
            <View
              style={{
                flex: 1,
                flexDirection: 'column',
                alignItems: 'center',
                margin: 12,
              }}
            >
              <H1 {...sharedColors.textExtraStyle}>🐝</H1>
              <H1 {...sharedColors.textExtraStyle}>
                {translate('noTodosTitle')}
              </H1>
              <Text
                style={{ textAlign: 'center', color: sharedColors.textColor }}
              >
                {translate('noTodosText')}
              </Text>
            </View>
          )}
        </Content>
        <ActionButton
          buttonColor={sharedColors.primaryColor}
          buttonTextStyle={{ color: sharedColors.invertedTextColor }}
          onPress={() => {
            if (
              !sharedSessionStore.user?.token &&
              sharedSessionStore.appInstalledMonthAgo
            ) {
              navigate('Login', { loginWall: true })
            } else if (
              !sharedSessionStore.user?.token ||
              sharedSessionStore.user?.isSubscriptionActive
            ) {
              navigate('AddTodo')
            } else {
              navigate('Paywall')
            }
          }}
        />
      </Container>
    )
  }
}

export function Current() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Current"
        component={CurrentContent}
        options={{
          title: translate('current'),
          ...sharedColors.headerExtraStyle,
        }}
      />
      <Stack.Screen
        name="AddTodo"
        component={AddTodo}
        options={{
          title: translate('addTodo'),
          ...sharedColors.headerExtraStyle,
        }}
      />
      <Stack.Screen
        name="BreakdownTodo"
        component={AddTodo}
        options={{
          title: translate('breakdownTodo'),
          ...sharedColors.headerExtraStyle,
        }}
      />
      <Stack.Screen
        name="Login"
        component={Login}
        options={{
          title: translate('pleaseLogin'),
          headerTitleAlign: 'center',
          ...sharedColors.headerExtraStyle,
        }}
      />
      <Stack.Screen
        name="Paywall"
        component={Paywall}
        options={{
          title: translate('subscription'),
          headerTitleAlign: 'center',
          ...sharedColors.headerExtraStyle,
        }}
      />
    </Stack.Navigator>
  )
}
