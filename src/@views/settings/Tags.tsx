import React, { Component } from 'react'
import { Text, Container, ActionSheet, View } from 'native-base'
import { sharedColors } from '@utils/sharedColors'
import { FlatList } from 'react-native-gesture-handler'
import { sharedTagStore } from '@stores/TagStore'
import { observer } from 'mobx-react'
import { Tag, cloneTag } from '@models/Tag'
import { translate } from '@utils/i18n'
import { alertConfirm } from '@utils/alert'
import { realm } from '@utils/realm'
import { navigate } from '@utils/navigation'
import { TableItem } from '@components/TableItem'
import { Alert } from 'react-native'
import { SyncRequestEvent } from '@sync/SyncRequestEvent'
import { sharedSync } from '@sync/Sync'
import fonts from '@utils/fonts'
import { IconButton } from '@components/IconButton'
import { Divider } from '@components/Divider'

class TagsVM {
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
        sharedSync.sync(SyncRequestEvent.Tag)
      }
    )
  }

  changeColor(tag: Tag) {
    navigate('ColorPicker', { tag: { ...cloneTag(tag) } })
  }

  changeColorToDefault(tag: Tag) {
    realm.write(() => {
      tag.color = undefined
      tag.updatedAt = new Date()
    })
    sharedTagStore.refreshTags()
    sharedSync.sync(SyncRequestEvent.Tag)
  }
  makeAnEpic(tag: Tag) {
    navigate('AddEpic', { tag: { ...cloneTag(tag) } })
  }
  editText(tag: Tag) {
    navigate('ChangeText', { tag: { ...cloneTag(tag) } })
  }
}

@observer
class DeleteAllTagsButton extends Component {
  render() {
    return !!sharedTagStore.undeletedTags.length ? (
      <TableItem
        onPress={() => {
          setTimeout(() => {
            Alert.alert(translate('deleteAllHashtagsConfirm'), '', [
              {
                text: translate('delete'),
                onPress: () => {
                  const undeletedTags = sharedTagStore.undeletedTags
                  realm.write(() => {
                    for (const tag of undeletedTags) {
                      tag.deleted = true
                      tag.updatedAt = new Date()
                    }
                  })
                  sharedTagStore.refreshTags()
                  sharedSync.sync(SyncRequestEvent.Tag)
                },
                style: 'destructive',
              },
              {
                text: translate('cancel'),
                style: 'cancel',
              },
            ])
          }, 100)
        }}
      >
        <Text style={{ color: sharedColors.destructIconColor, marginTop: 8 }}>
          {translate('deleteAllHashtags')}
        </Text>
      </TableItem>
    ) : null
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
        {sharedTagStore.sortedTags.length ? (
          <FlatList
            ListHeaderComponent={DeleteAllTagsButton}
            data={sharedTagStore.sortedTags}
            renderItem={({ item }) => {
              return (
                <View
                  style={{ paddingHorizontal: 16, marginVertical: 8, flex: 1 }}
                >
                  <View
                    style={{
                      borderColor: sharedColors.placeholderColor,
                      flex: 1,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={{
                        color: item.color || 'dodgerblue',
                        fontFamily: fonts.SFProTextRegular,
                      }}
                    >
                      #{item.tag}
                    </Text>
                    <View style={{ flexDirection: 'row' }}>
                      {!item.epic && (
                        <IconButton
                          onPress={() => {
                            this.vm.makeAnEpic(item)
                          }}
                          name="target_outline_28"
                        />
                      )}
                      <IconButton
                        onPress={() => {
                          this.vm.editText(item)
                        }}
                        name="edit_outline_28"
                      />
                      <IconButton
                        onPress={() => {
                          this.vm.deleteTag(item)
                        }}
                        color={sharedColors.destructIconColor}
                        name="delete_outline_28-iOS"
                      />
                    </View>
                  </View>
                  <Divider marginHorizontal={0} />
                </View>
              )
            }}
            keyExtractor={(tag) => (tag._id || tag._tempSyncId)!}
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
