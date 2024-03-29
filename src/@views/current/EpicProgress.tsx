import { Component } from 'react'
import { IconButton } from '@components/IconButton'
import { MelonTag } from '@models/MelonTag'
import { ProgressView } from '@components/ProgressView'
import { Text, View } from 'native-base'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { navigate } from '@utils/navigation'
import { observer } from 'mobx-react'
import { sharedAppStateStore } from '@stores/AppStateStore'
import { sharedColors } from '@utils/sharedColors'
import { sharedTagStore } from '@stores/TagStore'
import React from 'react'
import fonts from '@utils/fonts'

@observer
export class EpicText extends Component<{
  text: string
  color?: string
  onPress?: () => void
  disableMargin?: boolean
}> {
  render() {
    const actualText = (
      <Text
        style={{
          fontFamily: fonts.SFProRoundedRegular,
          fontSize: 22,
          marginHorizontal: this.props.disableMargin ? 0 : 16,
          color: this.props.color || sharedColors.primaryColor,
        }}
      >
        {this.props.text}
      </Text>
    )

    return this.props.onPress ? (
      <TouchableOpacity onPress={this.props.onPress}>
        {actualText}
      </TouchableOpacity>
    ) : (
      actualText
    )
  }
}

@observer
export class EpicProgress extends Component<{
  epic: MelonTag
  drag?: () => void
}> {
  render() {
    return (
      <TouchableOpacity
        onLongPress={this.props.drag}
        style={{
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginVertical: 8,
        }}
      >
        <EpicText
          color={this.props.epic.color}
          text={`${this.props.epic.epicPoints}`}
        />
        <View
          style={{ flex: 1, flexDirection: 'column', alignItems: 'center' }}
        >
          <EpicText
            color={this.props.epic.color}
            text={`#${this.props.epic.tag}`}
            onPress={() => {
              if (
                sharedAppStateStore.hash.indexOf(`#${this.props.epic.tag}`) < 0
              ) {
                sharedAppStateStore.hash.push(`#${this.props.epic.tag}`)
              }
              navigate('BottomPlanning')
            }}
          />
          <ProgressView
            progress={
              (this.props.epic.epicPoints || 1) /
              (this.props.epic.epicGoal || 1)
            }
            tintColor={this.props.epic.color || sharedColors.primaryColor}
            trackColor={sharedColors.progressBarBackground}
          />
        </View>
        {this.props.epic.epicPoints != this.props.epic.epicGoal ? (
          <EpicText
            color={this.props.epic.color}
            text={`${this.props.epic.epicGoal}`}
          />
        ) : (
          <View style={{ marginRight: 8 }}>
            <IconButton
              onPress={() => {
                sharedTagStore.completeEpic(this.props.epic)
              }}
              color={this.props.epic.color || sharedColors.destructIconColor}
              name="done_outline_28--check"
            />
          </View>
        )}
      </TouchableOpacity>
    )
  }
}
