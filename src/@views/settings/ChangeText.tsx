import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { makeObservable, observable } from 'mobx'
import { getTagById, Tag } from '@models/Tag'
import { Text, Button, Icon, View, Input } from 'native-base'
import { RouteProp, useRoute } from '@react-navigation/native'
import { realm } from '@utils/realm'
import { sharedTagStore } from '@stores/TagStore'
import { goBack } from '@utils/navigation'
import { sharedColors } from '@utils/sharedColors'
import { extraButtonProps } from '@utils/extraButtonProps'
import { translate } from '@utils/i18n'
import { sharedTodoStore } from '@stores/TodoStore'
import { sharedSync } from '@sync/Sync'
import { SyncRequestEvent } from '@sync/SyncRequestEvent'
import { Todo } from '@models/Todo'

const ChangeTextStore = {
  save: () => {},
}

export class ChangeTextHeaderRight extends Component {
  render() {
    return (
      <Button
        icon
        {...extraButtonProps(sharedColors)}
        small
        onPress={() => {
          ChangeTextStore.save()
        }}
      >
        <Icon
          type="MaterialIcons"
          name="done"
          {...sharedColors.iconExtraStyle}
        />
      </Button>
    )
  }
}

@observer
class ChangeTextContent extends Component<{
  route: RouteProp<Record<string, { tag: Tag } | undefined>, string>
}> {
  @observable tag?: Tag
  @observable newName: string = ''

  componentWillMount() {
    makeObservable(this)
  }

  componentDidMount() {
    this.tag = this.props.route.params?.tag
    ChangeTextStore.save = () => {
      this.save()
    }
  }

  save() {
    const dbtag = getTagById(this.tag?._id || this.tag?._tempSyncId)
    if (!dbtag || !this.newName || !this.newName.match(/^[\S]+$/)) {
      return
    }
    realm.write(() => {
      for (const todo of realm.objects(Todo).filtered('deleted = false')) {
        todo.text = todo.text
          .split(' ')
          .map((word) => {
            if (word !== `#${dbtag.tag}`) {
              return word
            }
            return `#${this.newName}`
          })
          .join(' ')
        todo.updatedAt = new Date()
      }
    })
    realm.write(() => {
      dbtag.tag = this.newName
      dbtag.updatedAt = new Date()
    })
    goBack()
    sharedTagStore.refreshTags()
    sharedTodoStore.refreshTodos()
    sharedSync.sync(SyncRequestEvent.All)
  }
  render() {
    return (
      <View
        style={{
          flexDirection: 'column',
          alignItems: 'center',
          flex: 1,
          justifyContent: 'center',
        }}
      >
        <Text>{`#${this.tag?.tag}`}</Text>
        <View
          style={{
            flexDirection: 'row',
          }}
        >
          <Input
            onChangeText={(text) => {
              this.newName = text
            }}
            placeholder={translate('editName')}
            style={{
              flex: 1,
              flexDirection: 'row',
              color: 'green',
              textAlign: 'center',
            }}
          />
        </View>
      </View>
    )
  }
}

export const ChangeText = () => {
  const route = useRoute<
    RouteProp<Record<string, { tag: Tag } | undefined>, string>
  >()
  return <ChangeTextContent route={route} />
}
