import React, { Component } from 'react'
import { Button, Text } from 'native-base'
import {
  deleteAllTodos,
  addTodosRu,
  addTodosEn,
  addTodosUk,
  addTodosIt,
  addTodosEs,
  addTodosPtBR,
} from '@utils/debug'
import { observer } from 'mobx-react'
import { sharedColors } from '@utils/sharedColors'
import { sharedSessionStore } from '@stores/SessionStore'
import { sharedSettingsStore, ColorMode } from '@stores/SettingsStore'

@observer
export class DebugButtons extends Component {
  render() {
    return __DEV__ ? (
      <>
        <Button
          onPress={() => {
            deleteAllTodos()
          }}
          accessible
          accessibilityLabel="delete"
          testID="delete"
        >
          <Text {...sharedColors.textExtraStyle}>delete all todos</Text>
        </Button>
        <Button
          onPress={() => {
            addTodosRu()
          }}
          accessible
          accessibilityLabel="add_ru"
          testID="add_ru"
        >
          <Text {...sharedColors.textExtraStyle}>add ru todos</Text>
        </Button>
        <Button
          onPress={() => {
            addTodosEn()
          }}
          accessible
          accessibilityLabel="add_en"
          testID="add_en"
        >
          <Text {...sharedColors.textExtraStyle}>add en todos</Text>
        </Button>
        <Button
          onPress={() => {
            addTodosUk()
          }}
          accessible
          accessibilityLabel="add_uk"
          testID="add_uk"
        >
          <Text {...sharedColors.textExtraStyle}>add uk todos</Text>
        </Button>
        <Button
          onPress={() => {
            addTodosIt()
          }}
          accessible
          accessibilityLabel="add_it"
          testID="add_it"
        >
          <Text {...sharedColors.textExtraStyle}>add it todos</Text>
        </Button>
        <Button
          onPress={() => {
            addTodosEs()
          }}
          accessible
          accessibilityLabel="add_es"
          testID="add_es"
        >
          <Text {...sharedColors.textExtraStyle}>add es todos</Text>
        </Button>
        <Button
          onPress={() => {
            addTodosPtBR()
          }}
          accessible
          accessibilityLabel="add_pt_br"
          testID="add_pt_br"
        >
          <Text {...sharedColors.textExtraStyle}>add pt-BR todos</Text>
        </Button>
        <Button
          onPress={() => {
            sharedSettingsStore.colorMode = ColorMode.dark
          }}
          accessible
          accessibilityLabel="turn_dark_on"
          testID="turn_dark_on"
        >
          <Text {...sharedColors.textExtraStyle}>turn dark on</Text>
        </Button>
        <Button
          onPress={() => {
            sharedSessionStore.numberOfTodosCompleted = 0
            sharedSessionStore.askedToRate = false
          }}
        >
          <Text {...sharedColors.textExtraStyle}>reset rating</Text>
        </Button>
      </>
    ) : null
  }
}
