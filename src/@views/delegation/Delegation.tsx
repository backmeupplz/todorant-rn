import React, { Component } from 'react'
import { observer, Observer } from 'mobx-react'
import { Container } from 'native-base'
import { HeaderScrollView } from '@components/HeaderScrollView'
import { translate } from '@utils/i18n'
import { createStackNavigator } from '@react-navigation/stack'
import { headerBackButtonProps } from '@utils/headerBackButton'
import { sharedSessionStore } from '@stores/SessionStore'
import { SignupPlaceholder } from '@views/delegation/SignupPlaceholder'
import { NoDelegatedTasks } from '@views/delegation/NoDelegatedTasks'
import { sharedTodoStore } from '@stores/TodoStore'
import { FlatList } from 'react-native-gesture-handler'
import { TodoCard } from '@components/TodoCard'
import { CardType } from '@components/TodoCard/CardType'

const Stack = createStackNavigator()

@observer
export class DelegateContent extends Component {
  render() {
    return (
      <Container>
        <HeaderScrollView
          title={translate('delegate.title')}
          infoTitle="delegate.info"
        >
          {!sharedSessionStore.user && <SignupPlaceholder />}
          {!!sharedSessionStore.user && (
            <>
              {!sharedTodoStore.unacceptedTodos.length && <NoDelegatedTasks />}
              {!!sharedTodoStore.unacceptedTodos.length && (
                <FlatList
                  data={sharedTodoStore.unacceptedTodos}
                  renderItem={({ item, index }) => {
                    return (
                      <TodoCard
                        key={index}
                        todo={item}
                        type={CardType.delegation}
                      />
                    )
                  }}
                />
              )}
            </>
          )}
        </HeaderScrollView>
      </Container>
    )
  }
}

export function Delegation() {
  return (
    <Observer>
      {() => (
        <Stack.Navigator>
          <Stack.Screen
            name="Delegation"
            component={DelegateContent}
            options={{
              headerShown: false,
              ...headerBackButtonProps(),
            }}
          />
        </Stack.Navigator>
      )}
    </Observer>
  )
}
