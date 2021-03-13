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
import {
  playDayComplete,
  playFrogComplete,
  playTaskComplete,
} from '@utils/sound'

@observer
class DebugButton extends Component<{
  text: string
  onPress: () => void
  testId: string
}> {
  render() {
    return (
      <Button
        style={{ margin: 2 }}
        onPress={this.props.onPress}
        accessible
        accessibilityLabel={this.props.testId}
        testID={this.props.testId}
      >
        <Text style={{ color: sharedColors.invertedTextColor }}>
          {this.props.text}
        </Text>
      </Button>
    )
  }
}

@observer
export class DebugButtons extends Component {
  render() {
    return __DEV__ ? (
      <>
        <DebugButton
          onPress={() => {
            deleteAllTodos()
          }}
          text="delete all todos"
          testId="delete"
        />
        <DebugButton
          onPress={() => {
            add5000Todos()
          }}
          text="add 5000 todos"
          testId="add_5000"
        />
        <DebugButton
          onPress={() => {
            addTodosRu()
          }}
          text="add ru todos"
          testId="add_ru"
        />
        <DebugButton
          onPress={() => {
            addTodosEn()
          }}
          text="add en todos"
          testId="add_en"
        />
        <DebugButton
          onPress={() => {
            addTodosUk()
          }}
          text="add uk todos"
          testId="add_uk"
        />
        <DebugButton
          onPress={() => {
            addTodosIt()
          }}
          text="add it todos"
          testId="add_it"
        />
        <DebugButton
          onPress={() => {
            addTodosEs()
          }}
          text="add es todos"
          testId="add_es"
        />
        <DebugButton
          onPress={() => {
            addTodosPtBR()
          }}
          text="add pt-BR todos"
          testId="add_pt_br"
        />
        <DebugButton
          onPress={() => {
            sharedSettingsStore.colorMode = ColorMode.dark
            updateAndroidNavigationBarColor(true)
          }}
          text="turn dark on"
          testId="turn_dark_on"
        />
        <DebugButton
          onPress={() => {
            sharedSessionStore.numberOfTodosCompleted = 0
            sharedSessionStore.askedToRate = false
          }}
          text="reset rating"
          testId="reset_rating"
        />
        <DebugButton
          onPress={() => {
            sharedSessionStore.numberOfTodosCompleted = 102
            sharedSessionStore.askedToRate = false
          }}
          text="open rate modal"
          testId="open_rating"
        />
        <DebugButton
          onPress={() => {
            playFrogComplete('nice')
          }}
          text="play nice sound"
          testId="play_nice"
        />
        <DebugButton
          onPress={() => {
            playFrogComplete('level_up')
          }}
          text="play level up sound"
          testId="play_level_up"
        />
        <DebugButton
          onPress={() => {
            playDayComplete()
          }}
          text="play day complete sound"
          testId="play_day_complete"
        />
        <DebugButton
          onPress={() => {
            playTaskComplete()
          }}
          text="play task complete sound"
          testId="play_task_complete"
        />
      </>
    ) : null
  }
}
