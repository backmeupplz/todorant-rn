import CurrentIcon from '@assets/images/current'
import CurrentActiveIcon from '@assets/images/current-active'
import DelegationIcon from '@assets/images/delegation'
import DelegationActiveIcon from '@assets/images/delegation-active'
import PlanningIcon from '@assets/images/planning'
import PlanningActiveIcon from '@assets/images/planning-active'
import SettingsIcon from '@assets/images/settings'
import SettingsActiveIcon from '@assets/images/settings-active'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { sharedAppStateStore } from '@stores/AppStateStore'
import { sharedSessionStore } from '@stores/SessionStore'
import { sharedSettingsStore } from '@stores/SettingsStore'
import { sharedTodoStore } from '@stores/TodoStore'
import { sharedSync } from '@sync/Sync'
import fonts from '@utils/fonts'
import { translate } from '@utils/i18n'
import { sharedColors } from '@utils/sharedColors'
import { Current } from '@views/current/Current'
import { Delegation } from '@views/delegation/Delegation'
import { Planning } from '@views/planning/Planning'
import { Settings } from '@views/settings/Settings'
import { observer } from 'mobx-react'
import { View } from 'native-base'
import React, { Component } from 'react'
import { Animated, Easing } from 'react-native'

const Tab = createBottomTabNavigator()

@observer
class SettingsRotatingIcon extends Component<{
  focused: boolean
  size: number
}> {
  spinAnimation = new Animated.Value(0)

  private startSpinningAnimation() {
    Animated.loop(
      Animated.timing(this.spinAnimation, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start()
  }

  componentDidMount() {
    this.startSpinningAnimation()
  }

  render() {
    const spin = this.spinAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    })
    if (sharedSync.isSyncing) {
      this.startSpinningAnimation()
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
  return (
    <>
      <Tab.Navigator
        {...({ language: sharedSettingsStore.language } as any)}
        backBehavior="none"
        screenOptions={({ route }) => ({
          detachPreviousScreen: false,
          headerShown: false,
          tabBarActiveTintColor: sharedColors.primaryColor,
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            backgroundColor: sharedColors.backgroundColor,
            borderTopColor: sharedColors.borderColor,
          },
          tabBarLabelStyle: {
            fontFamily: fonts.SFProTextRegular,
          },
          tabBarItemStyle: {
            paddingTop: 6,
          },
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
            1
            return (
              <View accessibilityLabel={name} testID={name} accessible>
                <View accessible={false}>
                  {icon}
                  {((route.name === 'Settings' && !sharedSessionStore.user) ||
                    (route.name === 'Delegation' &&
                      !!sharedTodoStore.delegatedToMeCount)) && (
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
      >
        {!sharedSessionStore.loggingOut && !sharedSessionStore.isInitialSync && (
          <>
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
          </>
        )}
        <Tab.Screen
          name="Settings"
          component={Settings}
          options={{ title: translate('settings') }}
        />
      </Tab.Navigator>
    </>
  )
})
