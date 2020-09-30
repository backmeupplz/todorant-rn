import React, { Component } from 'react'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { sharedAppStateStore, TodoSectionType } from '@stores/AppStateStore'
import { View, Text, Icon } from 'native-base'
import { sharedColors } from '@utils/sharedColors'
import { SectionHeaderOrTodo } from '@views/planning/SectionHeaderOrTodo'
import { IconButton } from '@components/IconButton'
import { navigate } from '@utils/navigation'
import { observer } from 'mobx-react'
import fonts from '@utils/fonts'
import moment from 'moment'
import i18n from 'i18n-js'
import { capitalizeSentence } from '@utils/capitalizeSentence'
import { PlanningVM } from '@views/planning/PlanningVM'

@observer
export class PlanningDateHeader extends Component<{
  drag: () => void
  isActive: boolean
  item: SectionHeaderOrTodo
  vm: PlanningVM
}> {
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
              sharedAppStateStore.todoSection === TodoSectionType.planning
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
                {this.props.item.title}
                {(this.props.item.title?.length || 0) === 10 &&
                  `, ${capitalizeSentence(
                    moment(this.props.item.title!)
                      .locale(i18n.locale)
                      .format('dddd')
                  )}`}
                {/* Comment out for better times */}
                {/* {this.props.vm.collapsedTitles.indexOf(
                  this.props.item.title || ''
                ) > -1
                  ? ` (${this.props.item.numberOfItems})`
                  : ''} */}
              </Text>
            </View>
          </TouchableOpacity>
          <IconButton
            onPress={() => {
              navigate('AddTodo', { date: this.props.item.title })
            }}
            size={20}
            name="add_outline_28"
            color={sharedColors.primaryColor}
          />
        </View>
        {/* Comment out for better times */}
        {/* <TouchableOpacity
          onPress={() => {
            if (
              this.props.vm.collapsedTitles.indexOf(
                this.props.item.title || ''
              ) < 0
            ) {
              if (this.props.item.title) {
                this.props.vm.collapsedTitles.push(this.props.item.title)
              }
            } else {
              this.props.vm.collapsedTitles = this.props.vm.collapsedTitles.filter(
                (t) => t !== this.props.item.title
              )
            }
          }}
          style={{ marginRight: 12 }}
        >
          <Icon
            type="MaterialIcons"
            name={
              this.props.vm.collapsedTitles.indexOf(
                this.props.item.title || ''
              ) < 0
                ? 'keyboard-arrow-down'
                : 'keyboard-arrow-up'
            }
            style={{ color: sharedColors.primaryColor }}
          />
        </TouchableOpacity> */}
      </View>
    )
  }
}
