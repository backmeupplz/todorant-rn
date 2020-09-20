import React, { Component } from 'react'
import { sharedColors } from '@utils/sharedColors'
import { Container, Text, Switch, Button, Input, Content } from 'native-base'
import { observer } from 'mobx-react'
import { translate } from '@utils/i18n'
import { observable } from 'mobx'
import { sharedSessionStore } from '@stores/SessionStore'
import { realm } from '@utils/realm'
import { Todo } from '@models/Todo'
import { alertConfirm, alertError } from '@utils/alert'
import { sockets } from '@utils/sockets'
import { _e, _d } from '@utils/encryption'
import { sharedTodoStore } from '@stores/TodoStore'
import { Spinner } from '@components/Spinner'
import { TableItem } from '@components/TableItem'
import { Divider } from '@components/Divider'
import { SectionHeader } from '@components/SectionHeader'
import { Platform } from 'react-native'
import { removePassword, setPassword } from '@utils/keychain'

@observer
export class Security extends Component {
  @observable loading = false

  @observable encryptionOn = false
  @observable password = ''
  @observable passwordRepeat = ''

  componentDidMount() {
    this.encryptionOn = !!sharedSessionStore.encryptionKey
    this.password = sharedSessionStore.encryptionKey || ''
    this.passwordRepeat = sharedSessionStore.encryptionKey || ''
  }

  changeEncrypted(encrypted: boolean) {
    this.loading = true
    try {
      const todos = realm
        .objects<Todo>('Todo')
        .filtered(`encrypted = ${!encrypted}`)
      realm.write(() => {
        for (const todo of todos) {
          todo.encrypted = encrypted
          todo.updatedAt = new Date()
        }
      })
      sockets.todoSyncManager.sync()
    } catch (err) {
      alertError(err)
    } finally {
      this.loading = false
    }
  }

  encryptEncrypted(encrypt: boolean, key: string) {
    this.loading = true
    try {
      const todos = realm.objects<Todo>('Todo').filtered(`encrypted = true`)
      realm.write(() => {
        for (const todo of todos) {
          if (encrypt) {
            todo.text = _e(todo.text, key)
          } else {
            todo.text = _d(todo.text, key)
          }
        }
      })
      sockets.todoSyncManager.sync()
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
                } else {
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
                          () => {
                            const encrytedTodos = realm
                              .objects<Todo>('Todo')
                              .filtered('encrypted = true')
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
              {
                realm
                  .objects<Todo>('Todo')
                  .filtered('encrypted = true && deleted = false').length
              }
            </Text>
          </TableItem>
          <TableItem>
            <Text {...sharedColors.regularTextExtraStyle}>
              {translate('unencryptedTodos')}
            </Text>
            <Text {...sharedColors.regularTextExtraStyle}>
              {
                realm
                  .objects<Todo>('Todo')
                  .filtered('encrypted = false && deleted = false').length
              }
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
                !sharedSessionStore.encryptionKey ||
                !realm.objects<Todo>('Todo').filtered('encrypted = false')
                  .length
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
                !sharedSessionStore.encryptionKey ||
                !realm.objects<Todo>('Todo').filtered('encrypted = true').length
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
