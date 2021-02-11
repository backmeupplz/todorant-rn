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
  add5000Todos,
} from '@utils/debug'
import { observer } from 'mobx-react'
import { sharedColors } from '@utils/sharedColors'
import { sharedSessionStore } from '@stores/SessionStore'
import { sharedSettingsStore, ColorMode } from '@stores/SettingsStore'
import { updateAndroidNavigationBarColor } from '@utils/androidNavigationBar'

@observer
export class DebugButtons extends Component {
  render() {
    return __DEV__ ? (
      <>
        <Button
          style={{ margin: 2 }}
          onPress={() => {
            deleteAllTodos()
          }}
          accessible
          accessibilityLabel="delete"
          testID="delete"
        >
          <Text style={{ color: sharedColors.invertedTextColor }}>
            delete all todos
          </Text>
        </Button>
        <Button
          style={{ margin: 2 }}
          onPress={() => {
            add5000Todos()
          }}
          accessible
          accessibilityLabel="add_5000"
          testID="add_5000"
        >
          <Text style={{ color: sharedColors.invertedTextColor }}>
            add 100 todos
          </Text>
        </Button>
        <Button
          style={{ margin: 2 }}
          onPress={() => {
            addTodosRu()
          }}
          accessible
          accessibilityLabel="add_ru"
          testID="add_ru"
        >
          <Text style={{ color: sharedColors.invertedTextColor }}>
            add ru todos
          </Text>
        </Button>
        <Button
          style={{ margin: 2 }}
          onPress={() => {
            addTodosEn()
          }}
          accessible
          accessibilityLabel="add_en"
          testID="add_en"
        >
          <Text style={{ color: sharedColors.invertedTextColor }}>
            add en todos
          </Text>
        </Button>
        <Button
          style={{ margin: 2 }}
          onPress={() => {
            addTodosUk()
          }}
          accessible
          accessibilityLabel="add_uk"
          testID="add_uk"
        >
          <Text style={{ color: sharedColors.invertedTextColor }}>
            add uk todos
          </Text>
        </Button>
        <Button
          style={{ margin: 2 }}
          onPress={() => {
            addTodosIt()
          }}
          accessible
          accessibilityLabel="add_it"
          testID="add_it"
        >
          <Text style={{ color: sharedColors.invertedTextColor }}>
            add it todos
          </Text>
        </Button>
        <Button
          style={{ margin: 2 }}
          onPress={() => {
            addTodosEs()
          }}
          accessible
          accessibilityLabel="add_es"
          testID="add_es"
        >
          <Text style={{ color: sharedColors.invertedTextColor }}>
            add es todos
          </Text>
        </Button>
        <Button
          style={{ margin: 2 }}
          onPress={() => {
            addTodosPtBR()
          }}
          accessible
          accessibilityLabel="add_pt_br"
          testID="add_pt_br"
        >
          <Text style={{ color: sharedColors.invertedTextColor }}>
            add pt-BR todos
          </Text>
        </Button>
        <Button
          style={{ margin: 2 }}
          onPress={() => {
            sharedSettingsStore.colorMode = ColorMode.dark
            updateAndroidNavigationBarColor(true)
          }}
          accessible
          accessibilityLabel="turn_dark_on"
          testID="turn_dark_on"
        >
          <Text style={{ color: sharedColors.invertedTextColor }}>
            turn dark on
          </Text>
        </Button>
        <Button
          style={{ margin: 2 }}
          onPress={() => {
            sharedSessionStore.numberOfTodosCompleted = 0
            sharedSessionStore.askedToRate = false
          }}
        >
          <Text style={{ color: sharedColors.invertedTextColor }}>
            reset rating
          </Text>
        </Button>
        <Button
          style={{ margin: 2 }}
          onPress={() => {
            sharedSessionStore.numberOfTodosCompleted = 102
            sharedSessionStore.askedToRate = false
          }}
        >
          <Text style={{ color: sharedColors.invertedTextColor }}>
            open rate modal
          </Text>
        </Button>
      </>
    ) : null
  }
}
