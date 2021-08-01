import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { makeObservable, observable } from 'mobx'
import { Tag } from '@models/Tag'
import { getTagById } from '@utils/getTagById'
import { Text, Button, Icon, View, Input } from 'native-base'
import { RouteProp, useRoute } from '@react-navigation/native'
import { sharedTagStore } from '@stores/TagStore'
import { goBack } from '@utils/navigation'
import { sharedColors } from '@utils/sharedColors'
import { extraButtonProps } from '@utils/extraButtonProps'
import { translate } from '@utils/i18n'
import { sharedTodoStore } from '@stores/TodoStore'
import { sharedSync } from '@sync/Sync'
import { SyncRequestEvent } from '@sync/SyncRequestEvent'
import { TouchableOpacity } from 'react-native'
import { IconButton } from '@components/IconButton'
import { ColorPicker, fromHsv, toHsv } from 'react-native-color-picker'
import { sharedSettingsStore } from '@stores/SettingsStore'
import { database, notDeletedTodos } from '@utils/wmdb'
import { MelonTodo } from '@models/MelonTodo'
import { cloneTag, MelonTag } from '@models/MelonTag'

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
  route: RouteProp<Record<string, { tag: MelonTag } | undefined>, string>
}> {
  @observable tag = cloneTag(this.props.route.params?.tag!)
  @observable newName: string = ''

  @observable colorPickerEnabled = false

  UNSAFE_componentWillMount() {
    makeObservable(this)
  }

  componentDidMount() {
    ChangeTextStore.save = () => {
      this.save()
    }
  }

  get colors() {
    return sharedSettingsStore.isDark
      ? [
          '#FFBE3D',
          '#FF984C',
          '#FF715B',
          '#6cdaaf',
          '#32A4C6',
          '#70bfd7',
          '#23738b',
          '#ab81d6',
        ]
      : [
          '#FFBE3D',
          '#FF984C',
          '#FF715B',
          '#2DCA8C',
          '#32A4C6',
          '#377DFF',
          '#4740D6',
          '#5603AD',
        ]
  }

  async save() {
    const dbtag = await getTagById(this.tag?._id || this.tag._tempSyncId)
    if (!dbtag) {
      return
    }
    if (this.newName && !this.newName.match(/^[\S]+$/)) this.newName = ''
    const toUpdate = [] as (MelonTodo | MelonTag)[]
    for (const todo of await notDeletedTodos.fetch()) {
      toUpdate.push(
        todo.prepareUpdate((todoToUpdate) => {
          todoToUpdate.text = todo.text
            .split(' ')
            .map((word) => {
              if (word !== `#${dbtag.tag}`) {
                return word
              }
              return `#${this.newName || dbtag.tag}`
            })
            .join(' ')
        })
      )
    }
    await database.write(async () => await database.batch(...toUpdate))
    await dbtag.changeText(this.newName || dbtag.tag)
    await dbtag.changeColor(this.tag.color || dbtag.color!)

    goBack()
    sharedTagStore.refreshTags()
    sharedTodoStore.refreshTodos()
    sharedSync.sync(SyncRequestEvent.All)
  }
  render() {
    return (
      <View style={{ flex: 1, backgroundColor: sharedColors.backgroundColor }}>
        <View
          style={{
            flexDirection: 'column',
            alignItems: 'center',
            flex: 1,
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              color: this.tag?.color || 'dodgerblue',
              maxWidth: '80%',
            }}
          >{`#${this.tag?.tag}`}</Text>
          <View
            style={{
              flexDirection: 'row',
            }}
          >
            <Input
              value={this.newName}
              onChangeText={(text) => {
                this.newName = text.trim()
              }}
              placeholder={translate('editName')}
              style={{
                flex: 1,
                flexDirection: 'row',
                color: sharedColors.textColor,
                textAlign: 'center',
              }}
            />
          </View>
          <View
            style={{
              flexDirection: 'row',
            }}
          >
            {this.colors.map((color, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  this.tag.color = color
                }}
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 16,
                  backgroundColor: color,
                  marginHorizontal: 6,
                }}
              />
            ))}
            <IconButton
              onPress={() => {
                this.colorPickerEnabled = !this.colorPickerEnabled
              }}
              name={
                this.colorPickerEnabled
                  ? 'cancel_outline_28--close'
                  : 'palette_outline_28'
              }
            />
          </View>
          {this.colorPickerEnabled && (
            <ColorPicker
              style={{ width: '50%', height: '50%' }}
              onColorSelected={(color) => {
                this.tag.color = color
              }}
              onColorChange={(hsv) => {
                this.tag.color = fromHsv(hsv)
              }}
              color={toHsv(this.tag.color || 'dodgerblue')}
              defaultColor={toHsv(this.tag.color || 'dodgerblue')}
              hideSliders
              sliderComponent={undefined as any}
            />
          )}
        </View>
      </View>
    )
  }
}

export const ChangeText = () => {
  const route = useRoute<
    RouteProp<Record<string, { tag: MelonTag } | undefined>, string>
  >()
  return <ChangeTextContent route={route} />
}
