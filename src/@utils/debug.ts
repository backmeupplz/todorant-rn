import { getTitle, Todo } from '@models/Todo'
import { sharedSessionStore } from '@stores/SessionStore'
import { sharedTodoStore } from '@stores/TodoStore'
import { getDateDateString, getDateMonthAndYearString } from '@utils/time'
import uuid from 'uuid'
import { database } from './wmdb'
import { todosCollection } from '@utils/wmdb'
import { MelonTodo } from '@models/MelonTodo'

export function deleteAllTodos() {
  sharedSessionStore.logout()
  sharedTodoStore.refreshTodos()
}

const dateS = new Date()

class TodoSample {
  updatedAt: Date = new Date()
  createdAt: Date = new Date()
  completed: boolean = true
  frog: boolean = false
  frogFails: number = 0
  skipped: boolean = false
  order: number = 0
  monthAndYear: string = getDateMonthAndYearString(dateS)
  deleted: boolean = true
  date: string = getDateDateString(dateS)
  time: string | undefined = undefined
  text: string = uuid()
  _exactDate = new Date(getTitle(this))

  _tempSyncId: string = uuid()
}

export async function add5000Todos() {
  let todos: any[] = []
  let counter = 0
  let lastYear = 2021
  for (let i = 0; i < 30; i++) {
    if (counter++ >= 30) {
      counter = 0
      dateS.setUTCFullYear(lastYear)
      lastYear++
    }
    todos.push(new TodoSample())
  }

  await database.write(async () => {
    await database.batch(
      ...todos.map((todo1) => {
        return todosCollection.prepareCreate((todo) => {
          todo.text = todo1.text
          todo.monthAndYear = todo1.monthAndYear
          todo.time = todo1.time
          todo.completed = false
          todo.deleted = false
          todo.date = todo1.date
        })
      })
    )
    console.log((await todosCollection.query().fetch()).length)
    // for (const vm of todos) {
    //   const newTodo = todosCollection.create((todo) => {
    //     todo.text = vm.text
    //     todo.monthAndYear = vm.monthAndYear
    //     todo.time = vm.time
    //     todo.completed = false
    //     todo.deleted = false
    //     todo.date = vm.date
    //   })
    // }
  })

  // await database.write(async () => {
  //   for (const vm of todos) {
  //     const newTodo = await todosCollection.create((todo) => {
  //       todo.text = vm.text
  //       todo.monthAndYear = vm.monthAndYear
  //       todo.time = vm.time
  //       todo.completed = false
  //       todo.deleted = false
  //     })
  //   }
  // })

  sharedTodoStore.refreshTodos()
}

export async function addTodosRu() {
  const template = {
    completed: false,
    frog: false,
    frogFails: 0,
    skipped: false,
    order: 0,
    monthAndYear: getDateMonthAndYearString(daysAgo(0)),
    deleted: false,
    date: getDateDateString(daysAgo(0)),
    time: undefined,
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

  const toCreate = [] as MelonTodo[]

  for (const todo of todos) {
    toCreate.push(
      todosCollection.prepareCreate((todoToCreate) =>
        Object.assign(todoToCreate, todo)
      )
    )
  }
  await database.write(async () => await database.batch(...toCreate))

  sharedTodoStore.refreshTodos()
}

export async function addTodosUk() {
  const template = {
    completed: false,
    frog: false,
    frogFails: 0,
    skipped: false,
    order: 0,
    monthAndYear: getDateMonthAndYearString(daysAgo(0)),
    deleted: false,
    date: getDateDateString(daysAgo(0)),
    time: undefined,
  }
  const todos = ([
    {
      text: 'Закінчити звіт для Трансгалактичної Федерації',
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

  const toCreate = [] as MelonTodo[]

  for (const todo of todos) {
    toCreate.push(
      todosCollection.prepareCreate((todoToCreate) =>
        Object.assign(todoToCreate, todo)
      )
    )
  }
  await database.write(async () => await database.batch(...toCreate))

  sharedTodoStore.refreshTodos()
}

export async function addTodosEn() {
  const template = {
    completed: false,
    frog: false,
    frogFails: 0,
    skipped: false,
    order: 0,
    monthAndYear: getDateMonthAndYearString(daysAgo(0)),
    deleted: false,
    date: getDateDateString(daysAgo(0)),
    time: undefined,
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

  const toCreate = [] as MelonTodo[]

  for (const todo of todos) {
    toCreate.push(
      todosCollection.prepareCreate((todoToCreate) =>
        Object.assign(todoToCreate, todo)
      )
    )
  }
  await database.write(async () => await database.batch(...toCreate))

  sharedTodoStore.refreshTodos()
}

export async function addTodosIt() {
  const template = {
    completed: false,
    frog: false,
    frogFails: 0,
    skipped: false,
    order: 0,
    monthAndYear: getDateMonthAndYearString(daysAgo(0)),
    deleted: false,
    date: getDateDateString(daysAgo(0)),
    time: undefined,
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

  const toCreate = [] as MelonTodo[]

  for (const todo of todos) {
    toCreate.push(
      todosCollection.prepareCreate((todoToCreate) =>
        Object.assign(todoToCreate, todo)
      )
    )
  }
  await database.write(async () => await database.batch(...toCreate))

  sharedTodoStore.refreshTodos()
}

export async function addTodosEs() {
  const template = {
    completed: false,
    frog: false,
    frogFails: 0,
    skipped: false,
    order: 0,
    monthAndYear: getDateMonthAndYearString(daysAgo(0)),
    deleted: false,
    date: getDateDateString(daysAgo(0)),
    time: undefined,
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

  const toCreate = [] as MelonTodo[]

  for (const todo of todos) {
    toCreate.push(
      todosCollection.prepareCreate((todoToCreate) =>
        Object.assign(todoToCreate, todo)
      )
    )
  }
  await database.write(async () => await database.batch(...toCreate))

  sharedTodoStore.refreshTodos()
}

export async function addTodosPtBR() {
  const template = {
    completed: false,
    frog: false,
    frogFails: 0,
    skipped: false,
    order: 0,
    monthAndYear: getDateMonthAndYearString(daysAgo(0)),
    deleted: false,
    date: getDateDateString(daysAgo(0)),
    time: undefined,
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

  const toCreate = [] as MelonTodo[]

  for (const todo of todos) {
    toCreate.push(
      todosCollection.prepareCreate((todoToCreate) =>
        Object.assign(todoToCreate, todo)
      )
    )
  }
  await database.write(async () => await database.batch(...toCreate))

  sharedTodoStore.refreshTodos()
}

function daysAgo(count: number) {
  const date = new Date()
  date.setDate(date.getDate() - count)
  return date
}
