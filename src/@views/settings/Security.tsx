import { Divider } from '@components/Divider'
import { SectionHeader } from '@components/SectionHeader'
import { Spinner } from '@components/Spinner'
import { TableItem } from '@components/TableItem'
import { MelonTodo } from '@models/MelonTodo'
import { Todo } from '@models/Todo'
import { Q } from '@nozbe/watermelondb'
import { sharedSessionStore } from '@stores/SessionStore'
import { sharedTodoStore } from '@stores/TodoStore'
import { sharedSync } from '@sync/Sync'
import { SyncRequestEvent } from '@sync/SyncRequestEvent'
import { alertConfirm, alertError } from '@utils/alert'
import { decrypt, _d, _e } from '@utils/encryption'
import { translate } from '@utils/i18n'
import { removePassword, setPassword } from '@utils/keychain'
import { TodoColumn } from '@utils/melondb'
import { sharedColors } from '@utils/sharedColors'
import { database, todosCollection } from '@utils/wmdb'
import { makeObservable, observable } from 'mobx'
import { observer } from 'mobx-react'
import { Button, Container, Content, Input, Switch, Text } from 'native-base'
import React, { Component } from 'react'
import { Platform } from 'react-native'

@observer
export class Security extends Component {
  @observable loading = false

  @observable encryptionOn = false
  @observable password = ''
  @observable passwordRepeat = ''

  @observable unencryptedCount = 0
  @observable encryptedCount = 0

  unencryptedTodos = sharedTodoStore.undeletedTodos.extend(
    Q.where(TodoColumn.encrypted, false)
  )

  encryptedTodos = sharedTodoStore.undeletedTodos.extend(
    Q.where(TodoColumn.encrypted, true)
  )

  UNSAFE_componentWillMount() {
    makeObservable(this)
  }

  componentDidMount() {
    this.encryptionOn = !!sharedSessionStore.encryptionKey
    this.password = sharedSessionStore.encryptionKey || ''
    this.passwordRepeat = sharedSessionStore.encryptionKey || ''
    this.unencryptedTodos
      .observeCount(false)
      .subscribe((count) => (this.unencryptedCount = count))
    this.encryptedTodos
      .observeCount(false)
      .subscribe((count) => (this.encryptedCount = count))
  }

  async changeEncrypted(encrypted: boolean) {
    this.loading = true
    try {
      const todos = await (!encrypted
        ? this.encryptedTodos
        : this.unencryptedTodos
      ).fetch()
      const toUpdate = [] as MelonTodo[]
      for (const todo of todos) {
        toUpdate.push(
          todo.prepareUpdate((todo) => {
            todo.encrypted = encrypted
            if (!encrypted) todo.text = decrypt(todo.text)
          })
        )
      }
      await database.write(async () => await database.batch(...toUpdate))
      sharedSync.sync(SyncRequestEvent.Todo)
    } catch (err) {
      alertError(err)
    } finally {
      this.loading = false
    }
  }

  async encryptEncrypted(encrypt: boolean, key: string) {
    this.loading = true
    try {
      const todos = await todosCollection
        .query(
          Q.where(TodoColumn.deleted, false),
          Q.where(TodoColumn.encrypted, true),
          Q.where(TodoColumn.delegator, null)
        )
        .fetch()
      const toUpdate = [] as MelonTodo[]
      for (const todo of todos) {
        if (encrypt) {
          toUpdate.push(
            todo.prepareUpdate((todo) => (todo.text = _e(todo.text, key)))
          )
        } else {
          toUpdate.push(
            todo.prepareUpdate((todo) => (todo.text = _d(todo.text, key)))
          )
        }
      }
      await database.write(async () => await database.batch(...toUpdate))

      await sharedSync.sync(SyncRequestEvent.Todo)
      sharedTodoStore.refreshTodos()
    } catch (err) {
      alertError(err)
    } finally {
      this.loading = false
    }
  }

  render() {
    return (
      <Container style={{ backgroundColor: sharedColors.backgroundColor }}>
        <Content>
          {/* Info and main toggle */}
          <TableItem>
            <Text {...sharedColors.regularTextExtraStyle}>
              {translate('infoSecurity')}
            </Text>
          </TableItem>
          <TableItem>
            <Text {...sharedColors.regularTextExtraStyle}>
              {translate('encryptTodo')}
            </Text>
            <Switch
              value={this.encryptionOn}
              onValueChange={(value) => {
                if (value) {
                  this.encryptionOn = value
                  return
                }
                if (sharedSessionStore.encryptionKey) {
                  alertConfirm(
                    translate('encryptionDisableConfirm'),
                    translate('disable'),
                    () => {
                      const key = sharedSessionStore.encryptionKey!
                      sharedSessionStore.encryptionKey = undefined
                      removePassword()
                      this.encryptionOn = false
                      this.encryptEncrypted(true, key)
                    }
                  )
                } else {
                  this.encryptionOn = false
                }
              }}
              thumbColor={Platform.OS === 'android' ? 'lightgrey' : undefined}
              trackColor={{ false: 'grey', true: sharedColors.primaryColor }}
            />
          </TableItem>
          {/* Encryption */}
          {this.encryptionOn && (
            <>
              <TableItem>
                <Input
                  placeholder={translate('password')}
                  value={this.password}
                  onChangeText={(text) => {
                    this.password = text
                  }}
                  placeholderTextColor={sharedColors.placeholderColor}
                  style={{
                    color: sharedColors.textColor,
                    marginVertical: -10,
                    paddingVertical: -10,
                  }}
                  secureTextEntry
                  autoCompleteType="password"
                  autoCorrect={false}
                  maxLength={35}
                />
              </TableItem>
              <TableItem>
                <Input
                  placeholder={translate('encryption.repeatPassword')}
                  value={this.passwordRepeat}
                  onChangeText={(text) => {
                    this.passwordRepeat = text
                  }}
                  placeholderTextColor={sharedColors.placeholderColor}
                  style={{
                    color: sharedColors.textColor,
                    marginVertical: -10,
                    paddingVertical: -10,
                  }}
                  secureTextEntry
                  autoCompleteType="password"
                  autoCorrect={false}
                  maxLength={35}
                />
              </TableItem>
              {!!this.password &&
                this.password !== sharedSessionStore.encryptionKey &&
                this.password === this.passwordRepeat && (
                  <TableItem>
                    <Button
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        borderRadius: 10,
                      }}
                      onPress={() => {
                        alertConfirm(
                          translate('encryptionConfirm'),
                          translate('save'),
                          async () => {
                            console.log('yes yes yes yes!')
                            const encrytedTodos =
                              await this.encryptedTodos.fetch()
                            if (encrytedTodos.length) {
                              const encryptedTodo = encrytedTodos[0]
                              const decryptedText = _d(
                                encryptedTodo.text,
                                this.password
                              )
                              if (!decryptedText) {
                                alertError(translate('passwordError'))
                                return
                              }
                            }
                            sharedSessionStore.encryptionKey = this.password
                            this.encryptEncrypted(false, this.password)
                            setPassword(sharedSessionStore.encryptionKey)
                          }
                        )
                      }}
                    >
                      <Text>{translate('save')}</Text>
                    </Button>
                  </TableItem>
                )}
            </>
          )}
          {/* Counts */}
          <Divider />
          <SectionHeader title={translate('count')} />
          <TableItem>
            <Text {...sharedColors.regularTextExtraStyle}>
              {translate('encryptedTodos')}
            </Text>
            <Text {...sharedColors.regularTextExtraStyle}>
              {this.encryptedCount}
            </Text>
          </TableItem>
          <TableItem>
            <Text {...sharedColors.regularTextExtraStyle}>
              {translate('unencryptedTodos')}
            </Text>
            <Text {...sharedColors.regularTextExtraStyle}>
              {this.unencryptedCount}
            </Text>
          </TableItem>
          {/* General */}
          <Divider />
          <SectionHeader title={translate('general')} />
          {this.loading && (
            <TableItem>
              <Spinner />
            </TableItem>
          )}
          <TableItem>
            <Button
              style={{ flex: 1, justifyContent: 'center', borderRadius: 10 }}
              onPress={() => {
                alertConfirm(
                  translate('confirmEncryptAll'),
                  translate('encryptAllButton'),
                  () => {
                    this.changeEncrypted(true)
                  }
                )
              }}
              disabled={
                !sharedSessionStore.encryptionKey || !this.unencryptedCount
              }
            >
              <Text>{translate('encryptAllButton')}</Text>
            </Button>
          </TableItem>
          <TableItem>
            <Button
              style={{ flex: 1, justifyContent: 'center', borderRadius: 10 }}
              onPress={() => {
                alertConfirm(
                  translate('confirmDecryptAll'),
                  translate('decryptAllButton'),
                  () => {
                    this.changeEncrypted(false)
                  }
                )
              }}
              disabled={
                !sharedSessionStore.encryptionKey || !this.encryptedCount
              }
            >
              <Text>{translate('decryptAllButton')}</Text>
            </Button>
          </TableItem>
        </Content>
      </Container>
    )
  }
}
