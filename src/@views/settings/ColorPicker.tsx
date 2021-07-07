import React, { Component } from 'react'
import { Container, H1, View, Icon } from 'native-base'
import { sharedColors } from '@utils/sharedColors'
import { observer } from 'mobx-react'
import { Tag } from '@models/Tag'
import { getTagById } from '@utils/getTagById'
import { RouteProp, useRoute } from '@react-navigation/native'
import { makeObservable, observable } from 'mobx'
import {
  ColorPicker as ColorPickerComponent,
  fromHsv,
} from 'react-native-color-picker'
import { extraButtonProps } from '@utils/extraButtonProps'
import { realm } from '@utils/realm'
import { sharedTagStore } from '@stores/TagStore'
import { goBack } from '@utils/navigation'
import { Button } from '@components/Button'
import { sharedSync } from '@sync/Sync'
import { SyncRequestEvent } from '@sync/SyncRequestEvent'
import { MelonTag } from '@models/MelonTag'

const ColorPickerComponentAny: any = ColorPickerComponent

const colorPickerStore = {
  save: () => {},
}

export class ColorPickerHeaderRight extends Component {
  render() {
    return (
      <Button
        icon
        {...extraButtonProps(sharedColors)}
        small
        onPress={() => {
          colorPickerStore.save()
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
class ColorPickerContent extends Component<{
  route: RouteProp<Record<string, { tag: MelonTag } | undefined>, string>
}> {
  @observable tag?: MelonTag
  @observable color = 'dodgerblue'

  UNSAFE_componentWillMount() {
    makeObservable(this)
  }

  componentDidMount() {
    this.tag = this.props.route.params?.tag
    if (this.tag?.color) {
      this.color = this.tag.color
    }
    colorPickerStore.save = () => {
      this.save()
    }
  }

  async save() {
    await this.tag?.changeColor(this.color)
    goBack()
    sharedTagStore.refreshTags()
    sharedSync.sync(SyncRequestEvent.Tag)
  }

  render() {
    return (
      <Container
        style={{ backgroundColor: sharedColors.backgroundColor, padding: 20 }}
      >
        <View style={{ alignItems: 'center' }}>
          <H1
            style={{
              ...sharedColors.textExtraStyle.style,
              justifyContent: 'center',
              color: this.color,
            }}
          >
            #{this.tag?.tag}
          </H1>
        </View>
        <ColorPickerComponentAny
          style={{ flex: 1 }}
          onColorSelected={(color: string) => {
            this.color = color
          }}
          onColorChange={(hsv: { h: number; s: number; v: number }) => {
            this.color = fromHsv(hsv)
          }}
          color={this.color}
          defaultColor={this.color}
          hideSliders
        />
      </Container>
    )
  }
}

export const ColorPicker = () => {
  const route = useRoute<
    RouteProp<Record<string, { tag: MelonTag } | undefined>, string>
  >()
  return <ColorPickerContent route={route} />
}
