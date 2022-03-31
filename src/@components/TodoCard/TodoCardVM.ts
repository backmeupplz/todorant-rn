import { Alert } from 'react-native'
import { CardType } from 'src/@components/TodoCard/CardType'
import { MelonTodo } from '@models/MelonTodo'
import { Q } from '@nozbe/watermelondb'
import { SyncRequestEvent } from '@sync/SyncRequestEvent'
import { TodoColumn } from '@utils/watermelondb/tables'
import { alertConfirm, alertMessage } from '@utils/alert'
import { checkDayCompletionRoutine } from '@utils/dayCompleteRoutine'
import { checkSubscriptionAndNavigate } from '@utils/checkSubscriptionAndNavigate'
import { database } from '@utils/watermelondb/wmdb'
import { fixOrder } from '@utils/fixOrder'
import {
  getDateDateString,
  getDateMonthAndYearString,
  getDateString,
  getDateStringFromTodo,
  getTodayWithStartOfDay,
} from '@utils/time'
import { getTitle } from '@models/Todo'
import { isTodoOld } from '@utils/isTodoOld'
import { makeObservable, observable } from 'mobx'
import { navigate } from '@utils/navigation'
import { playFrogComplete, playTaskComplete } from '@utils/sound'
import { sharedHeroStore } from '@stores/HeroStore'
import { sharedSessionStore } from '@stores/SessionStore'
import { sharedSettingsStore } from '@stores/SettingsStore'
import { sharedSync } from '@sync/Sync'
import { sharedTagStore } from '@stores/TagStore'
import { sharedTodoStore } from '@stores/TodoStore'
import { startConfetti } from '@components/Confetti'
import { translate } from '@utils/i18n'

export class TodoCardVM {
  @observable expanded = false

  constructor() {
    makeObservable(this)
  }

  async skip(todo: MelonTodo) {
    const neighbours = await sharedTodoStore
      .todosForDate(getDateStringFromTodo(todo))
      .extend(Q.where(TodoColumn.completed, todo.completed))
      .fetch()
    let startOffseting = false
    let offset = 0
    const toUpdate: MelonTodo[] = []
    await database.write(async () => await database.batch(...toUpdate))

    let foundValidNeighbour = false
    for (const t of neighbours) {
      if (
        (t._id && todo._id && t._id === todo._id) ||
        (t._tempSyncId &&
          todo._tempSyncId &&
          t._tempSyncId === todo._tempSyncId)
      ) {
        startOffseting = true
        continue
      }
      if (startOffseting) {
        offset++
        if (!t.skipped) {
          toUpdate.push(
            t.prepareUpdateWithDescription(
              (todo) => (todo.order -= offset),
              'skipping not skipped previously todo'
            )
          )
          foundValidNeighbour = true
          break
        }
      }
    }
    if (!foundValidNeighbour) {
      neighbours.forEach((n, i) => {
        if (i > 0) {
          toUpdate.push(
            n.prepareUpdateWithDescription(
              (todo) => todo.order--,
              'skipping todo without valid neighbour'
            )
          )
        }
      })
    }
    toUpdate.push(
      todo.prepareUpdateWithDescription((todo) => {
        todo.order += offset
        todo.skipped = true
      }, 'skipping todo')
    )

    await database.write(async () => await database.batch(...toUpdate))

    fixOrder([getTitle(todo)], undefined, undefined, [todo])
  }

  async isSkippable(todo: MelonTodo) {
    if (todo.frog || todo.time) {
      return false
    }
    const neighbours = await sharedTodoStore
      .todosForDate(getDateStringFromTodo(todo))
      .extend(Q.where(TodoColumn.completed, todo.completed))
      .fetch()
    return neighbours.length > 1
  }

  async moveToToday(todo: MelonTodo) {
    const today = getDateString(getTodayWithStartOfDay())
    const todosOnDate = await sharedTodoStore.todosForDate(today).fetch()
    const lastTodoOrder = todosOnDate[todosOnDate.length - 1].order
    await database.write(async () => {
      await todo.updateWithDescription((todo) => {
        todo.order = lastTodoOrder + 1
        todo.date = getDateDateString(today)
        todo.monthAndYear = getDateMonthAndYearString(today)
        todo._exactDate = new Date(getTitle(todo))
      }, 'moving to today')
    })
    sharedSync.sync(SyncRequestEvent.Todo)
  }

  async delete(todo: MelonTodo) {
    if (sharedSettingsStore.askBeforeDelete) {
      alertConfirm(
        `${translate('deleteTodo')} "${
          todo.text.length > 50 ? `${todo.text.substr(0, 50)}...` : todo.text
        }"?`,
        translate('delete'),
        async () => {
          await todo.delete('deleting todo with alert')
          sharedSync.sync(SyncRequestEvent.Todo)
        }
      )
    } else {
      await todo.delete('deleting todo without alert')
      sharedSync.sync(SyncRequestEvent.Todo)
    }
  }

  async accept(todo: MelonTodo) {
    if (!todo.date && !todo.monthAndYear) {
      navigate('EditTodo', { editedTodo: todo })
      return
    }
    await todo.accept('marking todo as accepted')

    fixOrder([getTitle(todo)])
  }

  async uncomplete(todo: MelonTodo) {
    await todo.uncomplete('uncompleting todo')
    sharedSync.sync(SyncRequestEvent.Todo)
  }

  async breakdownOrComplete(todo: MelonTodo) {
    if (todo.repetitive) {
      setTimeout(() => {
        Alert.alert(
          translate('breakdownMessage.title'),
          translate('breakdownMessage.text'),
          [
            {
              text: translate('cancel'),
              onPress: () => {
                // Do nothing
              },
            },
            {
              text: translate('breakdownMessage.complete'),
              onPress: () => {
                this.complete(todo)
              },
            },
            {
              text: translate('breakdownButton'),
              onPress: () => {
                checkSubscriptionAndNavigate('BreakdownTodo', {
                  breakdownTodo: todo,
                })
              },
            },
          ]
        )
      }, 100)
    } else {
      this.complete(todo)
    }
  }

  async complete(todo: MelonTodo) {
    if (todo.frog) {
      playFrogComplete()
    } else {
      if (sharedTodoStore.incompleteFrogsExist) {
        alertMessage(
          translate('frogsAlert.title'),
          translate('frogsAlert.text')
        )
      }
      playTaskComplete()
    }
    sharedHeroStore.incrementPoints()
    await sharedTagStore.incrementEpicPoints(todo.text, false)

    await todo.complete('completing todo')
    sharedSessionStore.numberOfTodosCompleted++
    startConfetti()
    checkDayCompletionRoutine()
    sharedSync.sync(SyncRequestEvent.Todo)
  }

  isOld(type: CardType, todo: MelonTodo) {
    return (
      type !== CardType.done && type !== CardType.delegation && isTodoOld(todo)
    )
  }
}
