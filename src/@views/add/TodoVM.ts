import { Tag } from '@models/Tag'
import { sharedTagStore } from '@stores/TagStore'
import { sharedSettingsStore } from '@stores/SettingsStore'
import {
  getDateString,
  getDateFromString,
  getDateMonthAndYearString,
  getDateDateString,
  getTodayWithStartOfDay,
} from '@utils/time'
import { Todo } from '@models/Todo'
import { observable, computed, makeObservable } from 'mobx'
import moment from 'moment'
import * as Animatable from 'react-native-animatable'
import React from 'react'
import { InteractionManager, Keyboard, TextInput } from 'react-native'
const {
  focusTextInput,
  blurInput,
} = require('react-native/Libraries/Components/TextInput/TextInputState')
import { sharedOnboardingStore } from '@stores/OnboardingStore'
import { TutorialStep } from '@stores/OnboardingStore/TutorialStep'
import { DelegationUser } from '@models/DelegationUser'
import { translate } from '@utils/i18n'
import { MelonTodo, MelonUser } from '@models/MelonTodo'
import { Q } from '@nozbe/watermelondb'
import { TagColumn } from '@utils/watermelondb/tables'
import { MelonTag } from '@models/MelonTag'
import { sanitizeLikeString } from '@utils/textSanitizer'

export class TodoVM {
  @observable text =
    !sharedOnboardingStore.tutorialIsShown &&
    (sharedOnboardingStore.step === TutorialStep.AddText ||
      sharedOnboardingStore.step === TutorialStep.AddTask ||
      sharedOnboardingStore.savedStep === TutorialStep.AddText)
      ? translate('onboarding.todoText')
      : ''
  @observable completed = false
  @observable frog = false
  @observable
  monthAndYear?: string = !sharedOnboardingStore.tutorialIsShown
    ? getDateMonthAndYearString(getTodayWithStartOfDay())
    : undefined
  @observable date?: string = !sharedOnboardingStore.tutorialIsShown
    ? getDateDateString(getTodayWithStartOfDay())
    : undefined
  @observable time?: string
  @observable repetitive = false

  @observable delegate?: MelonUser
  @observable delegateAccepted?: boolean

  @observable showDatePicker = false
  @observable showMonthAndYearPicker = false
  @observable showTimePicker = false

  editedTodo?: MelonTodo
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
        : sharedTagStore.undeletedTags.extend(Q.where(TagColumn.tag, null))
    }
    const match = matches[0]
    return sharedTagStore.undeletedTags.extend(
      Q.where(TagColumn.tag, Q.like(`%${sanitizeLikeString(match.substr(1))}%`))
    )
  }

  focus(tag = false) {
    const refocus = () => {
      const rootTextField = (this.todoTextField.current as any)?._root
      blurInput(rootTextField)
      requestAnimationFrame(() => {
        focusTextInput(rootTextField)
      })
    }
    if (tag) {
      InteractionManager.runAfterInteractions(refocus)
    } else {
      requestAnimationFrame(refocus)
    }
  }

  applyTag(tag: MelonTag) {
    const text = this.text
    const len = text.length
    const before = text.substr(0, this.cursorPosition)
    const after = text.substr(this.cursorPosition, len)
    const insertText =
      before.length && before[before.length - 1] !== ' '
        ? ` #${tag.tag}`
        : `#${tag.tag}`

    const emptyMatches = this.text.match(/#$/g) || []
    if (emptyMatches.length) {
      this.text = `${before}${tag.tag}${after} `
      this.focus(true)
      return
    }
    const matches = this.text.match(/#[\u0400-\u04FFa-zA-Z_0-9]+$/g) || []
    if (!matches.length) {
      this.text = `${before}${insertText}${after} `
      this.focus(true)
      return
    }
    const match = matches[0]
    this.text = `${before.substr(
      0,
      before.length - match.length
    )}${insertText}${after} `
    this.focus(true)
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
    return !!this.text && (!!this.delegate || !!this.monthAndYear)
  }

  constructor() {
    makeObservable(this)

    Keyboard.addListener('keyboardDidHide', () => {
      if (sharedOnboardingStore.tutorialIsShown) return
      if (!this.text) return
      if (
        sharedOnboardingStore.step === TutorialStep.AddText ||
        sharedOnboardingStore.step === TutorialStep.AddTextContinueButton
      ) {
        sharedOnboardingStore.nextStep(TutorialStep.SelectDate)
      }
    })

    if (sharedSettingsStore.showTodayOnAddTodo) {
      const now = getTodayWithStartOfDay()
      this.date = getDateDateString(now)
      this.monthAndYear = getDateMonthAndYearString(now)
    }
    if (sharedSettingsStore.newTodosGoFirst) {
      this.addOnTop = true
    }
  }

  setEditedTodo(todo: MelonTodo) {
    this.editedTodo = todo

    requestAnimationFrame(() => {
      this.text = todo.text
    })
    this.completed = todo.completed
    this.frog = todo.frog
    this.monthAndYear = todo.monthAndYear
    this.date = todo.date
    this.time = todo.time
    this.delegateAccepted = todo.delegateAccepted
    this.repetitive = todo.repetitive

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
