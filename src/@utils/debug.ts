import { sharedSessionStore } from './../@stores/SessionStore'
import { Todo, getTitle } from '@models/Todo'
import { realm } from '@utils/realm'
import { sharedTodoStore } from '@stores/TodoStore'
import { getDateMonthAndYearString, getDateDateString } from '@utils/time'
import uuid from 'uuid'

export function deleteAllTodos() {
  sharedSessionStore.logout()
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
  ].map((v) => {
    return Object.assign({}, template, v)
  }) as Todo[]).map((v) => {
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

export function addTodosUk() {
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
      text: 'Закінчити звіт для Трансгалактіческой Федерації',
      frog: true,
      monthAndYear: getDateMonthAndYearString(daysAgo(0)),
      date: getDateDateString(daysAgo(0)),
    },
    {
      text: 'Відправити посилку на Юпітер',
      monthAndYear: getDateMonthAndYearString(daysAgo(-1)),
      date: getDateDateString(daysAgo(-1)),
    },
    {
      text: 'Забрати онука з Вимірювання-28',
      monthAndYear: getDateMonthAndYearString(daysAgo(-2)),
      date: getDateDateString(daysAgo(-2)),
      time: '10:12',
    },
    {
      text: 'Розбити атом Гелія',
      monthAndYear: getDateMonthAndYearString(daysAgo(-3)),
      date: getDateDateString(daysAgo(-3)),
    },
    {
      text: 'Полагодити двигун на темної матерії в кораблі',
      monthAndYear: getDateMonthAndYearString(daysAgo(-4)),
      date: getDateDateString(daysAgo(-4)),
    },
    {
      text: 'Розібратися з тим, як доставити вчених до чорної діри',
      monthAndYear: getDateMonthAndYearString(daysAgo(-5)),
      date: getDateDateString(daysAgo(-5)),
    },
  ].map((v) => {
    return Object.assign({}, template, v)
  }) as Todo[]).map((v) => {
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
  ].map((v) => {
    return Object.assign({}, template, v)
  }) as Todo[]).map((v) => {
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

export function addTodosIt() {
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
      text: 'Rapporto finale per la Federazione Transgalattica',
      frog: true,
      monthAndYear: getDateMonthAndYearString(daysAgo(0)),
      date: getDateDateString(daysAgo(0)),
    },
    {
      text: 'Invia la spedizione a Giove',
      monthAndYear: getDateMonthAndYearString(daysAgo(-1)),
      date: getDateDateString(daysAgo(-1)),
    },
    {
      text: 'Riporta il nipote dalla Dimensione-28',
      monthAndYear: getDateMonthAndYearString(daysAgo(-2)),
      date: getDateDateString(daysAgo(-2)),
      time: '10:12',
    },
    {
      text: "Dividi l'atomo di idrogeno",
      monthAndYear: getDateMonthAndYearString(daysAgo(-3)),
      date: getDateDateString(daysAgo(-3)),
    },
    {
      text: 'Ripara il motore della nave della materia oscura',
      monthAndYear: getDateMonthAndYearString(daysAgo(-4)),
      date: getDateDateString(daysAgo(-4)),
    },
    {
      text: 'Trova un modo per mandare gli scienziati nel buco nero',
      monthAndYear: getDateMonthAndYearString(daysAgo(-5)),
      date: getDateDateString(daysAgo(-5)),
    },
  ].map((v) => {
    return Object.assign({}, template, v)
  }) as Todo[]).map((v) => {
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

export function addTodosEs() {
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
      text: 'Terminar el informe para la Federación Transgaláctica',
      frog: true,
      monthAndYear: getDateMonthAndYearString(daysAgo(0)),
      date: getDateDateString(daysAgo(0)),
    },
    {
      text: 'Envía el envío a Júpiter',
      monthAndYear: getDateMonthAndYearString(daysAgo(-1)),
      date: getDateDateString(daysAgo(-1)),
    },
    {
      text: 'Trae al nieto de vuelta de la Dimensión-28',
      monthAndYear: getDateMonthAndYearString(daysAgo(-2)),
      date: getDateDateString(daysAgo(-2)),
      time: '10:12',
    },
    {
      text: 'Dividir el átomo de Hidrógeno',
      monthAndYear: getDateMonthAndYearString(daysAgo(-3)),
      date: getDateDateString(daysAgo(-3)),
    },
    {
      text: 'Arreglar el motor de la nave de materia oscura',
      monthAndYear: getDateMonthAndYearString(daysAgo(-4)),
      date: getDateDateString(daysAgo(-4)),
    },
    {
      text: 'Inventar una forma de enviar a los científicos al agujero negro',
      monthAndYear: getDateMonthAndYearString(daysAgo(-5)),
      date: getDateDateString(daysAgo(-5)),
    },
  ].map((v) => {
    return Object.assign({}, template, v)
  }) as Todo[]).map((v) => {
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

export function addTodosPtBR() {
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
      text: 'Relatório de conclusão para a Federação Transgaláctica',
      frog: true,
      monthAndYear: getDateMonthAndYearString(daysAgo(0)),
      date: getDateDateString(daysAgo(0)),
    },
    {
      text: 'Enviar a remessa para Júpiter',
      monthAndYear: getDateMonthAndYearString(daysAgo(-1)),
      date: getDateDateString(daysAgo(-1)),
    },
    {
      text: 'Recupere o neto da Dimensão-28',
      monthAndYear: getDateMonthAndYearString(daysAgo(-2)),
      date: getDateDateString(daysAgo(-2)),
      time: '10:12',
    },
    {
      text: 'Dividir o Átomo de Hidrogênio',
      monthAndYear: getDateMonthAndYearString(daysAgo(-3)),
      date: getDateDateString(daysAgo(-3)),
    },
    {
      text: 'Consertar o motor do navio de matéria escura',
      monthAndYear: getDateMonthAndYearString(daysAgo(-4)),
      date: getDateDateString(daysAgo(-4)),
    },
    {
      text: 'Arranje uma maneira de mandar os cientistas para o buraco negro',
      monthAndYear: getDateMonthAndYearString(daysAgo(-5)),
      date: getDateDateString(daysAgo(-5)),
    },
  ].map((v) => {
    return Object.assign({}, template, v)
  }) as Todo[]).map((v) => {
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
