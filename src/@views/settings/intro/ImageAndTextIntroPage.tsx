import React, { Component } from 'react'
import { View, Text } from 'native-base'
import { Image, ImageSourcePropType } from 'react-native'
import { sharedColors } from '@utils/sharedColors'
import { observer } from 'mobx-react'
import { ScrollView } from 'react-native-gesture-handler'

@observer
class TextWithMargin extends Component {
  render() {
    return (
      <Text
        style={{
          ...sharedColors.textExtraStyle.style,
          marginBottom: 12,
        }}
      >
        {this.props.children}
      </Text>
    )
  }
}

@observer
class CircledView extends Component {
  render() {
    return (
      <View
        style={{
          width: 104,
          height: 104,
          borderRadius: 52,
          borderColor: sharedColors.textColor,
          borderWidth: 2,
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {this.props.children}
      </View>
    )
  }
}

@observer
export class ImageAndTextIntroPage extends Component<{
  image?: ImageSourcePropType
  index?: string
  texts: string[]
}> {
  render() {
    return (
      <ScrollView
        style={{ flex: 1, padding: 20 }}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <CircledView>
            {!!this.props.image && (
              <Image
                source={this.props.image}
                style={{
                  width: 100,
                  height: 100,
                  resizeMode: 'cover',
                  borderRadius: 50,
                }}
              />
            )}
            {this.props.index !== undefined && (
              <Text
                style={{
                  ...sharedColors.textExtraStyle.style,
                  fontSize: 50,
                }}
              >
                {this.props.index}
              </Text>
            )}
          </CircledView>
        </View>
        {this.props.texts.map((t) => (
          <TextWithMargin>{t}</TextWithMargin>
        ))}
      </ScrollView>
    )
  }
}
