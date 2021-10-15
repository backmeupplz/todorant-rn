import { isTodoOld } from '@utils/isTodoOld'
import { playFrogComplete, playTaskComplete } from '@utils/sound'
import { CardType } from './CardType'
import { translate } from '@utils/i18n'
import { alertConfirm, alertMessage } from '@utils/alert'
import { sharedSettingsStore } from '@stores/SettingsStore'
import { fixOrder } from '@utils/fixOrder'
import { sharedTodoStore } from '@stores/TodoStore'
import { getTitle } from '@models/Todo'
import {
  getDateStringFromTodo,
  getDateDateString,
  getDateMonthAndYearString,
  getTodayWithStartOfDay,
  getDateString,
} from '@utils/time'
import { startConfetti } from '@components/Confetti'
import { makeObservable, observable } from 'mobx'
import { navigate } from '@utils/navigation'
import { MelonTodo } from '@models/MelonTodo'
import { database } from '@utils/watermelondb/wmdb'
import { Q } from '@nozbe/watermelondb'
import { TodoColumn } from '@utils/watermelondb/tables'
import { sharedHeroStore } from '@stores/HeroStore'
import { sharedSessionStore } from '@stores/SessionStore'
import { checkDayCompletionRoutine } from '@utils/dayCompleteRoutine'
import { sharedTagStore } from '@stores/TagStore'
import { sharedSync } from '@sync/Sync'
import { SyncRequestEvent } from '@sync/SyncRequestEvent'
import { checkSubscriptionAndNavigate } from '@utils/checkSubscriptionAndNavigate'
import { Alert } from 'react-native'

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
          toUpdate.push(t.prepareUpdate((todo) => (todo.order -= offset)))
          foundValidNeighbour = true
          break
        }
      }
    }
    if (!foundValidNeighbour) {
      neighbours.forEach((n, i) => {
        if (i > 0) {
          toUpdate.push(n.prepareUpdate((todo) => todo.order--))
        }
      })
    }
    toUpdate.push(
      todo.prepareUpdate((todo) => {
        todo.order += offset
        todo.skipped = true
      })
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
      await todo.update((todo) => {
        todo.order = lastTodoOrder + 1
        todo.date = getDateDateString(today)
        todo.monthAndYear = getDateMonthAndYearString(today)
        todo._exactDate = new Date(getTitle(todo))
      })
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
          await todo.delete()
          sharedSync.sync(SyncRequestEvent.Todo)
        }
      )
    } else {
      await todo.delete()
      sharedSync.sync(SyncRequestEvent.Todo)
    }
  }

  async accept(todo: MelonTodo) {
    if (!todo.date && !todo.monthAndYear) {
      navigate('EditTodo', { editedTodo: todo })
      return
    }
    await todo.accept()

    fixOrder([getTitle(todo)])
  }

  async uncomplete(todo: MelonTodo) {
    await todo.uncomplete()
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
                sharedSync.sync(SyncRequestEvent.Todo)
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
      sharedSync.sync(SyncRequestEvent.Todo)
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

    await todo.complete()
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
