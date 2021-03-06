import { Tag } from '@models/Tag'
import { sharedTagStore } from '@stores/TagStore'
import { sharedSettingsStore } from '@stores/SettingsStore'
import {
  getDateString,
  getDateFromString,
  getDateMonthAndYearString,
  getDateDateString,
} from '@utils/time'
import { Todo } from '@models/Todo'
import { observable, computed, makeObservable } from 'mobx'
import moment from 'moment'
import * as Animatable from 'react-native-animatable'
import React from 'react'
import { findNodeHandle, Keyboard, TextInput } from 'react-native'
const {
  focusInput,
} = require('react-native/Libraries/Components/TextInput/TextInputState')
import { sharedOnboardingStore, TutorialStep } from '@stores/OnboardingStore'
import { getTodayWithStartOfDay } from '@utils/ObservableNow'

export class TodoVM {
  @observable text = ''
  @observable completed = false
  @observable frog = false
  @observable
  monthAndYear?: string = !sharedOnboardingStore.tutorialWasShown
    ? getDateMonthAndYearString(getTodayWithStartOfDay())
    : undefined
  @observable date?: string = !sharedOnboardingStore.tutorialWasShown
    ? getDateDateString(getTodayWithStartOfDay())
    : undefined
  @observable time?: string

  @observable showDatePicker = false
  @observable showMonthAndYearPicker = false
  @observable showTimePicker = false

  editedTodo?: Todo
  @observable showMore = false

  @observable order = 0

  @observable addOnTop = false

  @observable collapsed = false

  @observable showTags = false

  @observable cursorPosition = this.text.length

  todoTextField = React.createRef<TextInput>()
  todoTextView?: Animatable.View
  handleTodoTextViewRef = (ref: any) => (this.todoTextView = ref)
  exactDateView?: Animatable.Text
  handleExactDateViewRef = (ref: any) => (this.exactDateView = ref)
  monthView?: Animatable.Text
  handleMonthViewRef = (ref: any) => (this.monthView = ref)

  @computed get tags() {
    const emptyMatches = this.text.match(/#$/g) || []
    if (emptyMatches.length) {
      return sharedTagStore.undeletedTags
    }
    const matches = this.text.match(/#[\u0400-\u04FFa-zA-Z_0-9]+$/g) || []
    if (!matches.length) {
      return sharedSettingsStore.showMoreByDefault || this.showMore
        ? sharedTagStore.undeletedTags
        : []
    }
    const match = matches[0]
    return sharedTagStore.undeletedTags.filtered(
      `tag CONTAINS "${match.substr(1)}" AND tag != "${match.substr(1)}"`
    )
  }

  focus() {
    // Drop currentFocusedItem inside React-Native
    focusInput({})
    if (this.todoTextField.current) {
      ;(this.todoTextField.current as any)._root.focus()
    }
  }

  applyTag(tag: Tag) {
    const insertText = `#${tag.tag}`
    const text = this.text
    const len = text.length
    const before = text.substr(0, this.cursorPosition)
    const after = text.substr(this.cursorPosition, len)

    const emptyMatches = this.text.match(/#$/g) || []
    if (emptyMatches.length) {
      this.text = `${before}${tag.tag}${after} `
      ;(this.todoTextField.current as any)._root.focus()
      return
    }
    const matches = this.text.match(/#[\u0400-\u04FFa-zA-Z_0-9]+$/g) || []
    if (!matches.length) {
      this.text = `${before}${insertText}${after} `
      ;(this.todoTextField.current as any)._root.focus()
      return
    }
    const match = matches[0]
    this.text = `${before.substr(
      0,
      before.length - match.length
    )}${insertText}${after} `
    ;(this.todoTextField.current as any)._root.focus()
  }

  @computed
  get datePickerValue() {
    return this.monthAndYear
      ? getDateString(getDateFromString(this.monthAndYear, this.date))
      : undefined
  }
  set datePickerValue(value: string | undefined) {
    if (!value) {
      this.monthAndYear = undefined
      this.date = undefined
      return
    }
    this.monthAndYear = getDateMonthAndYearString(value)
    this.date = getDateDateString(value)
  }

  @computed
  get monthAndYearPickerValue() {
    return this.monthAndYear
      ? getDateFromString(this.monthAndYear, this.date)
      : undefined
  }
  set monthAndYearPickerValue(value: Date | undefined) {
    if (!value) {
      this.monthAndYear = undefined
      this.date = undefined
      return
    }
    if (this.showMonthAndYearPicker) {
      this.monthAndYear = getDateMonthAndYearString(value)
      this.date = undefined
    }
  }
  @computed
  get monthAndYearPickerValueString() {
    const date = this.monthAndYearPickerValue
    return date ? getDateMonthAndYearString(date) : undefined
  }

  @computed
  get timePickerValue() {
    return this.time ? moment(this.time, 'HH:mm').toDate() : new Date()
  }
  set timePickerValue(value: Date | undefined) {
    this.time = value ? moment(value).format('HH:mm') : undefined
  }

  @computed
  get markedDate() {
    const result = {} as { [index: string]: { selected: boolean } }
    if (this.datePickerValue) {
      result[this.datePickerValue] = { selected: true }
    }
    return result
  }

  @computed
  get isValid() {
    return !!this.text && !!this.monthAndYear
  }

  constructor() {
    makeObservable(this)

    Keyboard.addListener('keyboardDidHide', () => {
      if (this.text && sharedOnboardingStore.step === TutorialStep.AddText) {
        sharedOnboardingStore.nextStep()
      }
    })

    if (sharedSettingsStore.showTodayOnAddTodo) {
      this.date = getDateDateString(new Date())
      this.monthAndYear = getDateMonthAndYearString(new Date())
    }
    if (sharedSettingsStore.newTodosGoFirst) {
      this.addOnTop = true
    }
  }

  setEditedTodo(todo: Todo) {
    this.editedTodo = todo

    this.text = todo.text
    this.completed = todo.completed
    this.frog = todo.frog
    this.monthAndYear = todo.monthAndYear
    this.date = todo.date
    this.time = todo.time

    this.showMore = true
  }

  shakeInvalid() {
    if (!this.text && this.todoTextView && this.todoTextView.shake) {
      this.todoTextView.shake(1000)
    }
    if (!this.monthAndYear && this.exactDateView && this.exactDateView.shake) {
      this.exactDateView.shake(1000)
    }
    if (!this.monthAndYear && this.monthView && this.monthView.shake) {
      this.monthView.shake(1000)
    }
  }
}
