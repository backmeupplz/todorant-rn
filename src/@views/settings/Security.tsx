import React, { Component } from 'react'
import { sharedColors } from '@utils/sharedColors'
import {
  ListItem,
  Container,
  List,
  Text,
  Switch,
  Button,
  Input,
  Toast,
  Content,
  Spinner,
} from 'native-base'
import { observer } from 'mobx-react'
import { translate } from '@utils/i18n'
import { observable } from 'mobx'
import { sharedSessionStore } from '@stores/SessionStore'
import { realm } from '@utils/realm'
import { Todo } from '@models/Todo'
import { Clipboard } from 'react-native'
import { alertConfirm, alertError } from '@utils/alert'
import { sockets } from '@utils/sockets'
import { _e, _d } from '@utils/encryption'
import { sharedTodoStore } from '@stores/TodoStore'

@observer
export class Security extends Component {
  @observable loading = false

  @observable encryptionOn = false
  @observable password = ''

  componentDidMount() {
    this.encryptionOn = !!sharedSessionStore.encryptionKey
    this.password = sharedSessionStore.encryptionKey || ''
  }

  changeEncrypted(encrypted: boolean) {
    this.loading = true
    try {
      const todos = realm
        .objects<Todo>(Todo)
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
      const todos = realm.objects<Todo>(Todo).filtered(`encrypted = true`)
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
        <Content style={{ backgroundColor: sharedColors.backgroundColor }}>
          <List>
            <ListItem {...sharedColors.listItemExtraStyle}>
              <Text {...sharedColors.textExtraStyle}>
                {translate('infoSecurity')}
              </Text>
            </ListItem>
            <ListItem
              {...sharedColors.listItemExtraStyle}
              onLongPress={() => {
                if (!sharedSessionStore.encryptionKey) {
                  return
                }
                Clipboard.setString(sharedSessionStore.encryptionKey)
                Toast.show({
                  text: `"${sharedSessionStore.encryptionKey}" ${translate(
                    'copied'
                  )}`,
                })
              }}
            >
              <Text {...sharedColors.textExtraStyle}>
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
                          this.encryptionOn = false
                          this.encryptEncrypted(true, key)
                        }
                      )
                    } else {
                      this.encryptionOn = false
                    }
                  }
                }}
              />
            </ListItem>
            {this.encryptionOn && (
              <>
                <ListItem {...sharedColors.listItemExtraStyle}>
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
                </ListItem>
                {!!this.password &&
                  this.password !== sharedSessionStore.encryptionKey && (
                    <ListItem {...sharedColors.listItemExtraStyle}>
                      <Button
                        style={{ flex: 1, justifyContent: 'center' }}
                        onPress={() => {
                          alertConfirm(
                            translate('encryptionConfirm'),
                            translate('save'),
                            () => {
                              const encrytedTodos = realm
                                .objects<Todo>(Todo)
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
                            }
                          )
                        }}
                      >
                        <Text>{translate('save')}</Text>
                      </Button>
                    </ListItem>
                  )}
              </>
            )}
            <ListItem itemHeader>
              <Text {...sharedColors.textExtraStyle}>{translate('count')}</Text>
            </ListItem>
            <ListItem {...sharedColors.listItemExtraStyle}>
              <Text {...sharedColors.textExtraStyle}>
                {translate('encryptedTodos')}
              </Text>
              <Text {...sharedColors.textExtraStyle}>
                {
                  realm
                    .objects<Todo>(Todo)
                    .filtered('encrypted = true && deleted = false').length
                }
              </Text>
            </ListItem>
            <ListItem {...sharedColors.listItemExtraStyle}>
              <Text {...sharedColors.textExtraStyle}>
                {translate('unencryptedTodos')}
              </Text>
              <Text {...sharedColors.textExtraStyle}>
                {
                  realm
                    .objects<Todo>(Todo)
                    .filtered('encrypted = false && deleted = false').length
                }
              </Text>
            </ListItem>
            <ListItem itemHeader>
              <Text {...sharedColors.textExtraStyle}>
                {translate('general')}
              </Text>
            </ListItem>
            {this.loading && (
              <ListItem {...sharedColors.listItemExtraStyle}>
                <Spinner />
              </ListItem>
            )}
            <ListItem {...sharedColors.listItemExtraStyle}>
              <Button
                style={{ flex: 1, justifyContent: 'center' }}
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
                  !realm.objects<Todo>(Todo).filtered('encrypted = false')
                    .length
                }
              >
                <Text>{translate('encryptAllButton')}</Text>
              </Button>
            </ListItem>
            <ListItem {...sharedColors.listItemExtraStyle}>
              <Button
                style={{ flex: 1, justifyContent: 'center' }}
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
                  !realm.objects<Todo>(Todo).filtered('encrypted = true').length
                }
              >
                <Text>{translate('decryptAllButton')}</Text>
              </Button>
            </ListItem>
          </List>
        </Content>
      </Container>
    )
  }
}
