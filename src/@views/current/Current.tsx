import React, { Component } from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { Container, Content, View, Text, H1 } from 'native-base'
import { TodoCard, CardType } from '../../@components/TodoCard'
import ActionButton from 'react-native-action-button'
import { navigate } from '../../@utils/navigation'
import { AddTodo } from '../add/AddTodo'
import { sharedTodoStore } from '@stores/TodoStore'
import { observer, Observer } from 'mobx-react'
import { computed } from 'mobx'
import { Platform, ProgressViewIOS, ProgressBarAndroid } from 'react-native'
import { sharedSessionStore } from '@stores/SessionStore'
import { Login } from '@views/settings/Login'
import { Paywall } from '@views/settings/Paywall'
import { translate } from '@utils/i18n'
import { sharedColors } from '@utils/sharedColors'
import { TermsOfUse } from '@views/settings/TermsOfUse'
import { PrivacyPolicy } from '@views/settings/PrivacyPolicy'
import { LoginTelegram } from '@views/settings/LoginTelegram'
import { SubscriptionStatus } from '@models/User'
import { plusButtonAction } from '@utils/plusButtonAction'
import { IntroMessage } from '@views/settings/IntroMessage'
import { InfoButton } from '@views/settings/InfoButton'

const Stack = createStackNavigator()

class CurrentVM {
  @computed get currentTodo() {
    return sharedTodoStore.currentTodo
  }
}

export function subscriptionStatusName(
  subscriptionStatus?: SubscriptionStatus
) {
  switch (subscriptionStatus) {
    case SubscriptionStatus.earlyAdopter:
      return () => translate('earlyAdopter')
    case SubscriptionStatus.active:
      return () => translate('active')
    case SubscriptionStatus.trial:
      if (
        sharedSessionStore.isTrialOver ||
        sharedSessionStore.user?.createdOnApple
      ) {
        return () => translate('inactive')
      } else {
        return () => translate('trial')
      }
    case SubscriptionStatus.inactive:
      return () => translate('inactive')
    default:
      return () => ''
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
          onPress={plusButtonAction}
        />
      </Container>
    )
  }
}

export function Current() {
  return (
    <Observer>
      {() => (
        <Stack.Navigator>
          <Stack.Screen
            name="Current"
            component={CurrentContent}
            options={{
              title: translate('current'),
              ...sharedColors.headerExtraStyle,
              headerRight: InfoButton('infoCurrent'),
            }}
          />
          <Stack.Screen
            name="AddTodo"
            component={AddTodo}
            options={{
              title: translate('addTodo'),
              ...sharedColors.headerExtraStyle,
              headerRight: InfoButton('infoAdd'),
            }}
          />
          <Stack.Screen
            name="BreakdownTodo"
            component={AddTodo}
            options={{
              title: translate('breakdownTodo'),
              ...sharedColors.headerExtraStyle,
              headerRight: InfoButton('infoBreakdown'),
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
          <Stack.Screen
            name="Terms"
            component={TermsOfUse}
            options={{
              title: translate('termsOfUse'),
              ...sharedColors.headerExtraStyle,
            }}
          />
          <Stack.Screen
            name="Privacy"
            component={PrivacyPolicy}
            options={{
              title: translate('privacyPolicy'),
              ...sharedColors.headerExtraStyle,
            }}
          />
          <Stack.Screen
            name="LoginTelegram"
            component={LoginTelegram}
            options={{
              title: translate('loginTelegram'),
              headerTitleAlign: 'center',
              ...sharedColors.headerExtraStyle,
            }}
          />
          <Stack.Screen
            name="Intro"
            component={IntroMessage}
            options={{
              title: translate('introTitle'),
              headerTitleAlign: 'center',
              ...sharedColors.headerExtraStyle,
              headerRight: InfoButton('infoIntro'),
            }}
          />
        </Stack.Navigator>
      )}
    </Observer>
  )
}
