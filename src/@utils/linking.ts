import { getTitle } from '@models/Todo'
import { sharedSessionStore } from '@stores/SessionStore'
import { sharedSettingsStore } from '@stores/SettingsStore'
import { fixOrder } from '@utils/fixOrder'
import { translate } from '@utils/i18n'
import { navigate } from '@utils/navigation'
import { daysAgo } from '@utils/checkSubscriptionAndNavigate'
import { getDateDateString, getDateMonthAndYearString } from '@utils/time'
import { Toast } from 'native-base'
import QueryString from 'query-string'
import { Linking } from 'react-native'
import { sharedAppStateStore } from '@stores/AppStateStore'
import { alertConfirm, alertError } from './alert'
import { requestSync } from '@sync/syncEventEmitter'
import { SyncRequestEvent } from '@sync/SyncRequestEvent'
import { getLocalDelegation, updateOrCreateDelegation } from './delegations'
import { MelonTodo, MelonUser } from '@models/MelonTodo'
import { database, todosCollection } from './watermelondb/wmdb'

export async function setupLinking() {
  const initialUrl = await Linking.getInitialURL()
  if (initialUrl) {
    handleUrl(initialUrl)
  }
  Linking.addEventListener('url', ({ url }) => {
    handleUrl(url)
  })
}

function handleUrl(url: string) {
  const params = QueryString.parseUrl(url)
  if (params.url === 'todorant://create-todo' && params.query.articleBody) {
    if (
      !sharedSessionStore.user?.token &&
      sharedSessionStore.appInstalledMonthAgo
    ) {
      navigate('Login', { loginWall: true })
    } else if (
      !sharedSessionStore.user?.token ||
      sharedSessionStore.isSubscriptionActive
    ) {
      addTodo(params.query.articleBody as string)
    } else {
      navigate(
        'Paywall',
        sharedSessionStore.user.createdOnApple &&
          sharedSessionStore.user.createdAt >= daysAgo(14)
          ? { type: 'appleUnauthorized' }
          : undefined
      )
    }
  } else if (params.url === 'todorant://create-todo') {
    if (
      !sharedSessionStore.user?.token &&
      sharedSessionStore.appInstalledMonthAgo
    ) {
      navigate('Login', { loginWall: true })
    } else if (
      !sharedSessionStore.user?.token ||
      sharedSessionStore.isSubscriptionActive
    ) {
      navigate('AddTodo')
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
  } else if (params.url.match(/https:\/\/todorant.com\/invite\/*/g)) {
    alertConfirm(
      translate('delegate.inviteConfirm'),
      translate('ok'),
      async () => {
        const splittedUrl = params.url.split('/')
        const delegateInviteToken = splittedUrl[4]
        if (!sharedSessionStore.user?.token) {
          alertError(translate('pleaseLogin'))
          return
        }
        const localDelegator = await getLocalDelegation(
          { delegateInviteToken } as MelonUser,
          true
        )
        if (!localDelegator) {
          await updateOrCreateDelegation(
            { delegateInviteToken } as MelonUser,
            true,
            true
          )
        } else {
          alertError(translate('delegate.delegatorExists'))
          return
        }
        requestSync(SyncRequestEvent.Delegation)
      }
    )
  }
}

async function addTodo(text: string) {
  if (!sharedSettingsStore.showTodayOnAddTodo) {
    navigate('AddTodo', { text })
    return
  }
  const date = getDateDateString(new Date())
  const monthAndYear = getDateMonthAndYearString(new Date())

  const newTodo = {
    text,
    monthAndYear,
    date: date,
    encrypted: !!sharedSessionStore.encryptionKey,
  } as MelonTodo
  newTodo._exactDate = new Date(getTitle(newTodo))

  let createdTodo!: MelonTodo

  await database.write(async () => {
    createdTodo = await todosCollection.create((todo) =>
      Object.assign(todo, newTodo)
    )
  })

  // Sync todos
  fixOrder(
    [getTitle(createdTodo)],
    sharedSettingsStore.newTodosGoFirst ? [createdTodo] : [],
    sharedSettingsStore.newTodosGoFirst ? [] : [createdTodo]
  )
  // Show toast
  Toast.show({
    text: `${translate('addedTask')}: ${text}`,
  })
}
