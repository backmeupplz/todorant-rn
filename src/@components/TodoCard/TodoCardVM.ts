import { sharedHeroStore } from '@stores/HeroStore'
import { playFrogComplete, playTaskComplete } from '@utils/sound'
import { sharedSessionStore } from '@stores/SessionStore'
import { CardType } from './CardType'
import { translate } from '@utils/i18n'
import { alertConfirm } from '@utils/alert'
import { sharedSettingsStore } from '@stores/SettingsStore'
import { fixOrder } from '@utils/fixOrder'
import { sharedTodoStore } from '@stores/TodoStore'
import { Todo, getTitle, isTodoOld } from '@models/Todo'
import {
  getDateStringFromTodo,
  getDateDateString,
  getDateMonthAndYearString,
} from '@utils/time'
import { realm } from '@utils/realm'
import { startConfetti } from '@components/Confetti'
import { checkDayCompletionRoutine } from '@utils/dayCompleteRoutine'
import { sharedTagStore } from '@stores/TagStore'

export class TodoCardVM {
  skip(todo: Todo) {
    const neighbours = sharedTodoStore
      .todosForDate(getDateStringFromTodo(todo))
      .filtered(`completed = ${todo.completed}`)
    let startOffseting = false
    let offset = 0
    realm.write(() => {
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
            t.order -= offset
            t.updatedAt = new Date()
            foundValidNeighbour = true
            break
          }
        }
      }
      if (!foundValidNeighbour) {
        neighbours.forEach((n, i) => {
          if (i > 0) {
            n.order--
            n.updatedAt = new Date()
          }
        })
      }
      todo.order += offset
      todo.skipped = true
      todo.updatedAt = new Date()
    })

    fixOrder([getTitle(todo)], undefined, undefined, [todo])
  }

  isSkippable(todo: Todo) {
    if (todo.frog || todo.time) {
      return false
    }
    const neighbours = sharedTodoStore
      .todosForDate(getDateStringFromTodo(todo))
      .filtered(`completed = ${todo.completed}`)
    return neighbours.length > 1
  }

  moveToToday(todo: Todo) {
    const oldTitle = getTitle(todo)
    realm.write(() => {
      todo.date = getDateDateString(new Date())
      todo.monthAndYear = getDateMonthAndYearString(new Date())
      todo._exactDate = new Date(getTitle(todo))
      todo.updatedAt = new Date()
    })

    fixOrder([oldTitle, getTitle(todo)], undefined, undefined, [todo])
  }

  delete(todo: Todo) {
    if (sharedSettingsStore.askBeforeDelete) {
      alertConfirm(
        `${translate('deleteTodo')} "${
          todo.text.length > 50 ? `${todo.text.substr(0, 50)}...` : todo.text
        }"?`,
        translate('delete'),
        () => {
          realm.write(() => {
            todo.deleted = true
            todo.updatedAt = new Date()
          })

          fixOrder([getTitle(todo)])
        }
      )
    } else {
      realm.write(() => {
        todo.deleted = true
        todo.updatedAt = new Date()
      })

      fixOrder([getTitle(todo)])
    }
  }

  uncomplete(todo: Todo) {
    realm.write(() => {
      todo.completed = false
      todo.updatedAt = new Date()
    })

    fixOrder([getTitle(todo)], undefined, undefined, [todo])
  }

  complete(todo: Todo) {
    if (todo.frog) {
      playFrogComplete()
    } else {
      playTaskComplete()
    }
    sharedHeroStore.incrementPoints()
    sharedTagStore.incrementEpicPoints(todo.text)

    realm.write(() => {
      todo.completed = true
      todo.updatedAt = new Date()
    })

    fixOrder([getTitle(todo)])
    sharedSessionStore.numberOfTodosCompleted++
    startConfetti()
    checkDayCompletionRoutine()
  }

  isOld(type: CardType, todo: Todo) {
    return type !== CardType.done && isTodoOld(todo)
  }
}
