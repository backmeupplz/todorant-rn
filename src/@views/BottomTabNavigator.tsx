import React, { Component } from 'react'
import { Settings } from '@views/settings/Settings'
import { Planning } from '@views/planning/Planning'
import { Current } from '@views/current/Current'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { sharedSessionStore } from '@stores/SessionStore'
import { sharedTodoStore } from '@stores/TodoStore'
import { observer } from 'mobx-react'
import { translate } from '@utils/i18n'
import { sharedColors } from '@utils/sharedColors'
import { sharedSettingsStore } from '@stores/SettingsStore'
import { sharedAppStateStore } from '@stores/AppStateStore'
import fonts from '@utils/fonts'
import CurrentIcon from '@assets/images/current'
import CurrentActiveIcon from '@assets/images/current-active'
import PlanningIcon from '@assets/images/planning'
import PlanningActiveIcon from '@assets/images/planning-active'
import SettingsIcon from '@assets/images/settings'
import SettingsActiveIcon from '@assets/images/settings-active'
import DelegationIcon from '@assets/images/delegation'
import DelegationActiveIcon from '@assets/images/delegation-active'
import { Delegation } from '@views/delegation/Delegation'
import { Animated, Easing } from 'react-native'
import { View } from 'native-base'

const Tab = createBottomTabNavigator()

@observer
class SettingsRotatingIcon extends Component<{
  focused: boolean
  size: number
}> {
  isSyncing = false
  spinAnimation = new Animated.Value(0)

  componentDidMount() {
    Animated.loop(
      Animated.timing(this.spinAnimation, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start()
  }

  render() {
    const spin = this.spinAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    })
    if (this.isSyncing) {
      return (
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          {this.props.focused
            ? SettingsActiveIcon({
                width: this.props.size,
                height: this.props.size,
              })
            : SettingsIcon({ width: this.props.size, height: this.props.size })}
        </Animated.View>
      )
    } else {
      return this.props.focused
        ? SettingsActiveIcon({
            width: this.props.size,
            height: this.props.size,
          })
        : SettingsIcon({ width: this.props.size, height: this.props.size })
    }
  }
}

export default observer(() => {
  // Hack to make this reactive
  let languageTag = sharedAppStateStore.languageTag
  languageTag = `${languageTag}`

  return (
    <>
      <Tab.Navigator
        {...({ language: sharedSettingsStore.language } as any)}
        backBehavior="none"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, size }) => {
            let name = 'current'
            let icon = focused ? CurrentActiveIcon({}) : CurrentIcon({})
            if (route.name === 'Planning') {
              name = 'planning'
              icon = focused
                ? PlanningActiveIcon({ width: size, height: size })
                : PlanningIcon({ width: size, height: size })
            } else if (route.name === 'Delegation') {
              name = 'delegation'
              icon = focused
                ? DelegationActiveIcon({ width: size, height: size })
                : DelegationIcon({ width: size, height: size })
            } else if (route.name === 'Settings') {
              name = 'settings'
              icon = <SettingsRotatingIcon focused={focused} size={size} />
            }
            return (
              <View accessibilityLabel={name} testID={name} accessible>
                <View accessible={false}>
                  {icon}
                  {((route.name === 'Settings' && !sharedSessionStore.user) ||
                    (route.name === 'Delegation' &&
                      !!sharedTodoStore.unacceptedTodos.length)) && (
                    <View
                      style={{
                        position: 'absolute',
                        width: 6,
                        height: 6,
                        backgroundColor: 'red',
                        top: 0,
                        right: -5,
                        borderRadius: 3,
                      }}
                    />
                  )}
                </View>
              </View>
            )
          },
        })}
        tabBarOptions={{
          activeTintColor: sharedColors.primaryColor,
          inactiveTintColor: 'gray',
          style: {
            backgroundColor: sharedColors.backgroundColor,
            borderTopColor: sharedColors.borderColor,
          },
          labelStyle: {
            fontFamily: fonts.SFProTextRegular,
          },
          tabStyle: {
            paddingTop: 6,
          },
        }}
      >
        {!sharedTodoStore.isPlanningRequired && (
          <Tab.Screen
            name="Current"
            component={Current}
            options={{ title: translate('current') }}
          />
        )}
        <Tab.Screen
          name="Planning"
          component={Planning}
          options={{ title: translate('planning') }}
        />
        <Tab.Screen
          name="Delegation"
          component={Delegation}
          options={{ title: translate('delegate.title') }}
        />
        <Tab.Screen
          name="Settings"
          component={Settings}
          options={{ title: translate('settings') }}
        />
      </Tab.Navigator>
    </>
  )
})
