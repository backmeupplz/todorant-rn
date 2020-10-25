import { sharedAppStateStore } from './../@stores/AppStateStore'
import { translate } from '@utils/i18n'
import { daysAgo } from '@utils/plusButtonAction'
import { navigate } from '@utils/navigation'
import { sharedSessionStore } from '@stores/SessionStore'
import { getDateDateString, getDateMonthAndYearString } from '@utils/time'
import { sharedSettingsStore } from '@stores/SettingsStore'
import { fixOrder } from '@utils/fixOrder'
import { getTitle, Todo } from '@models/Todo'
import { realm } from '@utils/realm'
import { Linking } from 'react-native'
import QueryString from 'query-string'
import uuid from 'uuid'
import { Toast } from 'native-base'

export async function setupLinking() {
  const initialUrl = await Linking.getInitialURL()
  if (initialUrl) {
    console.log('initial')
    handleUrl(initialUrl)
  }
  Linking.addEventListener('url', ({ url }) => {
    console.log('consequent')
    handleUrl(url)
  })
}

function handleUrl(url: string) {
  const params = QueryString.parseUrl(url)
  if (params.url === 'todorant://create-todo') {
    if (
      !sharedSessionStore.user?.token &&
      sharedSessionStore.appInstalledMonthAgo
    ) {
      navigate('Login', { loginWall: true })
    } else if (
      !sharedSessionStore.user?.token ||
      sharedSessionStore.isSubscriptionActive
    ) {
      addTodo((params.query.articleBody || '') as string)
    } else {
      navigate(
        'Paywall',
        sharedSessionStore.user.createdOnApple &&
          sharedSessionStore.user.createdAt >= daysAgo(14)
          ? { type: 'appleUnauthorized' }
          : undefined
      )
    }
  } else if (params.url === 'todorant://search' && params.query.query) {
    navigate('Planning')
    sharedAppStateStore.searchEnabled = true
    sharedAppStateStore.searchQuery = [params.query.query as string]
  }
}

function addTodo(text: string) {
  if (!sharedSettingsStore.showTodayOnAddTodo) {
    navigate('AddTodo', { text })
    return
  }
  const date = getDateDateString(new Date())
  const monthAndYear = getDateMonthAndYearString(new Date())

  const todo = {
    updatedAt: new Date(),
    createdAt: new Date(),
    text,
    completed: false,
    frog: false,
    frogFails: 0,
    skipped: false,
    order: 0,
    monthAndYear,
    deleted: false,
    date: date,
    encrypted: !!sharedSessionStore.encryptionKey,
    _tempSyncId: uuid(),
  } as Todo
  todo._exactDate = new Date(getTitle(todo))

  realm.write(() => {
    realm.create<Todo>('Todo', todo)
  })
  // Sync todos
  fixOrder(
    [getTitle(todo)],
    sharedSettingsStore.newTodosGoFirst ? [todo] : [],
    sharedSettingsStore.newTodosGoFirst ? [] : [todo]
  )
  // Show toast
  Toast.show({
    text: `${translate('addedTask')}: ${text}`,
  })
}
