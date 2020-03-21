import { Todo } from './../@models/Todo'
import { getTitle } from '@models/Todo'
import { realm } from './realm'
import { sharedTodoStore } from '@stores/TodoStore'
import { getDateMonthAndYearString, getDateDateString } from './time'
import uuid from 'uuid'

export function deleteAllTodos() {
  sharedTodoStore.logout()
  sharedTodoStore.refreshTodos()
}

export function addTodosRu() {
  const template = {
    updatedAt: new Date(),
    createdAt: new Date(),
    completed: false,
    frog: false,
    frogFails: 0,
    skipped: false,
    order: 0,
    monthAndYear: getDateMonthAndYearString(daysAgo(0)),
    deleted: false,
    date: getDateDateString(daysAgo(0)),
    time: undefined,

    _tempSyncId: uuid(),
  }
  const todos = ([
    {
      text: 'Закончить отчет для Трансгалактической Федерации',
      frog: true,
      monthAndYear: getDateMonthAndYearString(daysAgo(0)),
      date: getDateDateString(daysAgo(0)),
    },
    {
      text: 'Отправить посылку на Юпитер',
      monthAndYear: getDateMonthAndYearString(daysAgo(-1)),
      date: getDateDateString(daysAgo(-1)),
    },
    {
      text: 'Забрать внука из Измерения-28',
      monthAndYear: getDateMonthAndYearString(daysAgo(-2)),
      date: getDateDateString(daysAgo(-2)),
      time: '10:12',
    },
    {
      text: 'Разбить атом Гелия',
      monthAndYear: getDateMonthAndYearString(daysAgo(-3)),
      date: getDateDateString(daysAgo(-3)),
    },
    {
      text: 'Починить двигатель на темной материи в корабле',
      monthAndYear: getDateMonthAndYearString(daysAgo(-4)),
      date: getDateDateString(daysAgo(-4)),
    },
    {
      text: 'Разобраться с тем, как доставить ученых к черной дыре',
      monthAndYear: getDateMonthAndYearString(daysAgo(-5)),
      date: getDateDateString(daysAgo(-5)),
    },
  ].map(v => {
    return Object.assign({}, template, v)
  }) as Todo[]).map(v => {
    v._exactDate = new Date(getTitle(v))
    return v
  })

  realm.write(() => {
    for (const todo of todos) {
      realm.create(Todo, todo)
    }
  })

  sharedTodoStore.refreshTodos()
}

export function addTodosEn() {
  const template = {
    updatedAt: new Date(),
    createdAt: new Date(),
    completed: false,
    frog: false,
    frogFails: 0,
    skipped: false,
    order: 0,
    monthAndYear: getDateMonthAndYearString(daysAgo(0)),
    deleted: false,
    date: getDateDateString(daysAgo(0)),
    time: undefined,

    _tempSyncId: uuid(),
  }
  const todos = ([
    {
      text: 'Finish report for the Transgalactic Federation',
      frog: true,
      monthAndYear: getDateMonthAndYearString(daysAgo(0)),
      date: getDateDateString(daysAgo(0)),
    },
    {
      text: 'Send the shipment to Jupiter',
      monthAndYear: getDateMonthAndYearString(daysAgo(-1)),
      date: getDateDateString(daysAgo(-1)),
    },
    {
      text: 'Get the grandson back from the Dimension-28',
      monthAndYear: getDateMonthAndYearString(daysAgo(-2)),
      date: getDateDateString(daysAgo(-2)),
      time: '10:12',
    },
    {
      text: 'Split the Hydrogen atom',
      monthAndYear: getDateMonthAndYearString(daysAgo(-3)),
      date: getDateDateString(daysAgo(-3)),
    },
    {
      text: 'Fix the dark matter ship engine',
      monthAndYear: getDateMonthAndYearString(daysAgo(-4)),
      date: getDateDateString(daysAgo(-4)),
    },
    {
      text: 'Come up with a way to send the scientists to the black hole',
      monthAndYear: getDateMonthAndYearString(daysAgo(-5)),
      date: getDateDateString(daysAgo(-5)),
    },
  ].map(v => {
    return Object.assign({}, template, v)
  }) as Todo[]).map(v => {
    v._exactDate = new Date(getTitle(v))
    return v
  })

  realm.write(() => {
    for (const todo of todos) {
      realm.create(Todo, todo)
    }
  })

  sharedTodoStore.refreshTodos()
}

function daysAgo(count: number) {
  const date = new Date()
  date.setDate(date.getDate() - count)
  return date
}
