import React, { Component } from 'react'
import { Text, ListItem, Container, Icon, ActionSheet } from 'native-base'
import { sharedColors } from '@utils/sharedColors'
import { FlatList } from 'react-native-gesture-handler'
import { sharedTagStore } from '@stores/TagStore'
import { observer } from 'mobx-react'
import { Tag } from '@models/Tag'
import { translate } from '@utils/i18n'
import { alertConfirm } from '@utils/alert'
import { realm } from '@utils/realm'
import { sockets } from '@utils/sockets'
import { navigate } from '@utils/navigation'
import { TableItem } from '@components/TableItem'

class TagsVM {
  onTap(tag: Tag) {
    const hasColor = !!tag.color
    const options = [
      translate('changeColor'),
      translate('delete'),
      translate('cancel'),
    ]
    if (hasColor) {
      options.splice(1, 0, translate('changeColorToDefault'))
    }
    const cancelButtonIndex = options.length - 1
    const deleteButtonIndex = options.length - 2
    ActionSheet.show(
      {
        options,
        cancelButtonIndex: cancelButtonIndex,
        destructiveButtonIndex: deleteButtonIndex,
        title: `#${tag.tag}${hasColor ? ` — ${tag.color}` : ''}`,
      },
      (buttonIndex) => {
        if (buttonIndex === cancelButtonIndex) {
        } else if (buttonIndex === deleteButtonIndex) {
          this.deleteTag(tag)
        } else if (buttonIndex === 0) {
          this.changeColor(tag)
        } else {
          this.changeColorToDefault(tag)
        }
      }
    )
  }

  deleteTag(tag: Tag) {
    alertConfirm(
      `${translate('deleteTodo')} "#${
        tag.tag.length > 50 ? `${tag.tag.substr(0, 50)}...` : tag.tag
      }"?`,
      translate('delete'),
      () => {
        realm.write(() => {
          tag.deleted = true
          tag.updatedAt = new Date()
        })
        sharedTagStore.refreshTags()
        sockets.tagsSyncManager.sync()
      }
    )
  }

  changeColor(tag: Tag) {
    navigate('ColorPicker', { tag: { ...tag } })
  }

  changeColorToDefault(tag: Tag) {
    realm.write(() => {
      tag.color = undefined
      tag.updatedAt = new Date()
    })
    sharedTagStore.refreshTags()
    sockets.tagsSyncManager.sync()
  }
}

@observer
export class Tags extends Component {
  vm = new TagsVM()

  render() {
    return (
      <Container
        style={{
          backgroundColor: sharedColors.backgroundColor,
        }}
      >
        {sharedTagStore.undeletedTags.length ? (
          <FlatList
            data={sharedTagStore.undeletedTags}
            renderItem={({ item }) => {
              return (
                <TableItem onPress={() => this.vm.onTap(item)}>
                  <Text style={{ color: item.color || 'dodgerblue' }}>
                    #{item.tag}
                  </Text>
                </TableItem>
              )
            }}
            keyExtractor={(_, index) => `${index}`}
          />
        ) : (
          <Text
            style={{
              ...sharedColors.regularTextExtraStyle.style,
              textAlign: 'center',
              padding: 20,
            }}
          >
            {translate('emptyHashtags')}
          </Text>
        )}
      </Container>
    )
  }
}
