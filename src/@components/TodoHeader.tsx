import React, { Component } from 'react'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { sharedAppStateStore, TodoSectionType } from '@stores/AppStateStore'
import { View, Text } from 'native-base'
import { sharedColors } from '@utils/sharedColors'
import { IconButton } from '@components/IconButton'
import { navigate } from '@utils/navigation'
import { observer } from 'mobx-react'
import fonts from '@utils/fonts'
import moment from 'moment'
import i18n from 'i18n-js'
import { capitalizeSentence } from '@utils/capitalizeSentence'
import { PlanningVM } from '@views/planning/PlanningVM'
import { SectionListData } from 'react-native'
import { Todo } from '@models/Todo'
import { sharedOnboardingStore } from '@stores/OnboardingStore'
import { sharedSettingsStore } from '@stores/SettingsStore'

@observer
export class TodoHeader extends Component<{
  item: string
  drag?: () => void
  isActive?: boolean
  date?: boolean
  onPlusPress?: () => void
  hidePlus?: boolean
}> {
  renderDateContent() {
    return (
      <>
        {this.props.item}
        {(this.props.item.length || 0) === 10 &&
          `, ${capitalizeSentence(
            moment(this.props.item)
              .locale(sharedSettingsStore.language || 'en')
              .format('dddd')
          )}`}
      </>
    )
  }

  render() {
    return (
      <View
        style={{
          marginTop: 16,
          marginBottom: 8,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onLongPress={
              sharedAppStateStore.todoSection === TodoSectionType.planning &&
              sharedOnboardingStore.tutorialIsShown
                ? this.props.drag
                : undefined
            }
          >
            <View
              style={{
                backgroundColor: 'rgba(255, 100, 26, 0.06)',
                borderTopRightRadius: 6,
                borderBottomRightRadius: 6,
              }}
            >
              <Text
                style={{
                  color: sharedColors.primaryColor,
                  marginVertical: 4,
                  marginLeft: this.props.isActive ? 30 : 16,
                  marginRight: 12,
                  fontFamily: fonts.SFProRoundedRegular,
                }}
              >
                {this.props.date ? this.renderDateContent() : this.props.item}
              </Text>
            </View>
          </TouchableOpacity>
          {!this.props.hidePlus && (
            <IconButton
              disabled={!sharedOnboardingStore.tutorialIsShown}
              onPress={() => {
                this.props.onPlusPress
                  ? this.props.onPlusPress()
                  : navigate('AddTodo', { date: this.props.item })
              }}
              size={20}
              name="add_outline_28"
              color={sharedColors.primaryColor}
            />
          )}
        </View>
      </View>
    )
  }
}
