import { Button } from '@components/Button'
import {
  ColorPicker as ColorPickerComponent,
  fromHsv,
} from 'react-native-color-picker'
import { Component } from 'react'
import { Container, H1, Icon, View } from 'native-base'
import { MelonTag } from '@models/MelonTag'
import { RouteProp, useRoute } from '@react-navigation/native'
import { SyncRequestEvent } from '@sync/SyncRequestEvent'
import { extraButtonProps } from '@utils/extraButtonProps'
import { goBack } from '@utils/navigation'
import { makeObservable, observable } from 'mobx'
import { observer } from 'mobx-react'
import { sharedColors } from '@utils/sharedColors'
import { sharedSync } from '@sync/Sync'
import { sharedTagStore } from '@stores/TagStore'

const ColorPickerComponentAny: any = ColorPickerComponent

const colorPickerStore = {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
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
    await this.tag?.changeColor(
      this.color,
      'changing tag color from colorpicker'
    )
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
  const route =
    useRoute<RouteProp<Record<string, { tag: MelonTag } | undefined>, string>>()
  return <ColorPickerContent route={route} />
}
