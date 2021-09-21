import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { TodoVM } from '@views/add/TodoVM'
import { sharedAppStateStore } from '@stores/AppStateStore'
import {
  View,
  Text,
  Input,
  Icon,
  List,
  ListItem,
  ActionSheet,
} from 'native-base'
import { sharedColors } from '@utils/sharedColors'
import { translate } from '@utils/i18n'
import { CollapseButton } from './CollapseButton'
import {
  Platform,
  Clipboard,
  ViewStyle,
  StyleProp,
  InteractionManager,
  StyleSheet,
  ScrollView,
} from 'react-native'
import { Calendar } from 'react-native-calendars'
import { getDateString, getDateMonthAndYearString } from '@utils/time'
import { sharedSettingsStore } from '@stores/SettingsStore'
import moment, { Moment } from 'moment'
import MonthPicker from 'react-native-month-picker'
import DateTimePicker from '@react-native-community/datetimepicker'
import {
  Switch,
  FlatList,
  TouchableOpacity,
} from 'react-native-gesture-handler'
import { sharedSessionStore } from '@stores/SessionStore'
import { IconButton } from '@components/IconButton'
import CustomIcon from '@components/CustomIcon'
import fonts from '@utils/fonts'
import { computed, makeObservable, observable } from 'mobx'
import * as Animatable from 'react-native-animatable'
import { sharedOnboardingStore } from '@stores/OnboardingStore'
import { TutorialStep } from '@stores/OnboardingStore/TutorialStep'
import { Divider } from '@components/Divider'
import { sharedTodoStore } from '@stores/TodoStore'
import { sharedDelegateStateStore } from '@stores/DelegateScreenStateStore'
import { sharedDelegationStore } from '@stores/DelegationStore'
import withObservables from '@nozbe/with-observables'
import { MelonTag } from '@models/MelonTag'

const fontSize = 18
const verticalSpacing = 8

@observer
class TouchableOpacityIcon extends Component<{
  onPress: () => void
  iconName: string
  style?: StyleProp<ViewStyle>
  size?: number
}> {
  render() {
    return (
      <TouchableOpacity onPress={this.props.onPress} style={this.props.style}>
        <Icon
          type="MaterialIcons"
          name={this.props.iconName}
          style={{
            color: sharedColors.textColor,
            fontSize: this.props.size,
          }}
        />
      </TouchableOpacity>
    )
  }
}

@observer
class CollapsedTodo extends Component<{
  deleteTodo?: () => void
  vm: TodoVM
  drag?: () => void
}> {
  render() {
    return (
      <TouchableOpacity
        style={{
          flex: 1,
          paddingVertical: verticalSpacing,
          paddingLeft: 12,
          flexDirection: 'row',
          alignItems: 'center',
          paddingRight: 16,
        }}
        onPress={() => {
          this.props.vm.collapsed = false
        }}
        onLongPress={this.props.drag}
      >
        {!!this.props.deleteTodo && (
          <IconButton
            onPress={() => {
              if (this.props.deleteTodo) {
                this.props.deleteTodo()
              }
            }}
            color={sharedColors.destructIconColor}
            name="delete_outline_28-iOS"
          />
        )}
        <View
          style={{
            flexDirection: 'row',
            flex: 1,
          }}
        >
          <View
            style={{
              justifyContent: 'center',
              flexDirection: 'column',
              flex: 1,
              paddingHorizontal: 8,
            }}
          >
            <Text
              numberOfLines={1}
              style={{
                color: sharedColors.textColor,
                fontFamily: fonts.SFProDisplayMedium,
                fontSize: fontSize,
              }}
            >
              {this.props.vm.frog && (
                <Text {...sharedColors.textExtraStyle}>🐸 </Text>
              )}
              {this.props.vm.time && (
                <Text {...sharedColors.textExtraStyle}>
                  {this.props.vm.time}{' '}
                </Text>
              )}
              <Text {...sharedColors.textExtraStyle}>
                {this.props.vm.text
                  ? this.props.vm.text
                  : translate('todo.create.placeholder')}
              </Text>
            </Text>
            {!!this.props.vm.monthAndYear && (
              <Text
                style={{
                  fontFamily: fonts.SFProTextRegular,
                  fontSize: 13,
                  color: sharedColors.placeholderColor,
                }}
              >{`${this.props.vm.monthAndYear}${
                this.props.vm.date ? `-${this.props.vm.date}` : ''
              }`}</Text>
            )}
          </View>
          <CollapseButton vm={this.props.vm} />
        </View>
      </TouchableOpacity>
    )
  }
}

export let textRowNodeId: number
export let dateRowNodeId: number
export let frogRowNodeId: number
export let completedRowNodeId: number
export let showMoreRowNodeId: number

@observer
class TextRow extends Component<{
  vm: TodoVM
  showCross: boolean
}> {
  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      if (sharedOnboardingStore.step === TutorialStep.AddTask) {
        sharedOnboardingStore.nextStep()
      }
    })
  }

  render() {
    return (
      <Animatable.View
        ref={this.props.vm.handleTodoTextViewRef}
        onLayout={({ nativeEvent: { target } }: any) => {
          textRowNodeId = target
        }}
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          borderColor: sharedColors.placeholderColor,
          paddingVertical: verticalSpacing,
        }}
      >
        <Input
          onSubmitEditing={() => {
            if (sharedOnboardingStore.tutorialIsShown) return
            if (!this.props.vm.text) return
            if (
              sharedOnboardingStore.step === TutorialStep.AddText ||
              sharedOnboardingStore.step === TutorialStep.AddTextContinueButton
            ) {
              sharedOnboardingStore.nextStep(TutorialStep.SelectDate)
            }
          }}
          multiline={sharedOnboardingStore.tutorialIsShown}
          placeholder={translate('todo.create.text')}
          value={this.props.vm.text}
          onChangeText={(text) => {
            this.props.vm.text = text
            if (!sharedOnboardingStore.tutorialIsShown) {
              sharedOnboardingStore.textInTodo = text
            }
          }}
          placeholderTextColor={sharedColors.placeholderColor}
          maxLength={1500}
          style={{
            color: sharedColors.textColor,
            fontFamily: fonts.SFProTextRegular,
            fontSize: fontSize,
            padding: 0,
            paddingLeft: Platform.OS === 'android' ? 1 : undefined,
          }}
          autoFocus={sharedOnboardingStore.tutorialIsShown}
          disabled={
            this.props.vm.editedTodo?.encrypted &&
            !sharedSessionStore.encryptionKey
          }
          selectionColor={sharedColors.primaryColor}
          keyboardType={
            Platform.OS === 'ios' &&
            sharedOnboardingStore.step !== TutorialStep.AddText
              ? 'twitter'
              : undefined
          }
          returnKeyType={
            sharedOnboardingStore.step === TutorialStep.AddText
              ? 'done'
              : undefined
          }
          ref={this.props.vm.todoTextField}
          onSelectionChange={({ nativeEvent: { selection } }) =>
            (this.props.vm.cursorPosition = selection.start)
          }
        />
        {!!this.props.vm.text && this.props.showCross && (
          <TouchableOpacityIcon
            onPress={async () => {
              this.props.vm.text = ''
            }}
            iconName="close"
            style={{ padding: 5 }}
            size={25}
          />
        )}
        {!(
          this.props.vm.editedTodo?.encrypted &&
          !sharedSessionStore.encryptionKey
        ) &&
          !this.props.vm.text && (
            <TouchableOpacityIcon
              onPress={async () => {
                const textFromClipboard = await Clipboard.getString()
                this.props.vm.text = `${this.props.vm.text}${textFromClipboard}`
              }}
              iconName="assignment"
              style={{ padding: 5 }}
              size={25}
            />
          )}
        <CollapseButton vm={this.props.vm} />
      </Animatable.View>
    )
  }
}

const enhanceTags = withObservables(['vm'], (items) => {
  return {
    tags: items.vm.tags,
  }
})

const TagsRow = enhanceTags((props: { tags: MelonTag[]; vm: TodoVM }) => {
  return (
    <View
      style={{
        paddingBottom: verticalSpacing / 2,
      }}
    >
      <FlatList
        horizontal
        data={props.tags}
        keyExtractor={(_, index) => `${index}`}
        renderItem={({ item }: { item: any }) => {
          return (
            <TouchableOpacity
              onPress={() => {
                props.vm.applyTag(item)
              }}
              style={{ paddingHorizontal: 4 }}
            >
              <Text
                style={{
                  color: item.color || 'dodgerblue',
                }}
              >
                #{item.tag}
              </Text>
            </TouchableOpacity>
          )
        }}
      />
    </View>
  )
})

@observer
class DateRow extends Component<{
  vm: TodoVM
}> {
  render() {
    return (
      <TouchableOpacity
        disabled={
          !sharedOnboardingStore.tutorialIsShown &&
          !(
            sharedOnboardingStore.step === TutorialStep.BreakdownTodoAction ||
            sharedOnboardingStore.step === TutorialStep.SelectDate
          )
        }
        onPress={() => {
          if (!sharedOnboardingStore.tutorialIsShown) {
            if (sharedOnboardingStore.step === TutorialStep.SelectDate) {
              sharedOnboardingStore.nextStep(TutorialStep.SelectDateNotAllowed)
              return
            }
          }
          this.props.vm.showDatePicker = !this.props.vm.showDatePicker
          if (!this.props.vm.date) {
            this.props.vm.monthAndYear = undefined
            this.props.vm.date = undefined
          }
          this.props.vm.showMonthAndYearPicker = false
        }}
        style={{
          borderColor: sharedColors.placeholderColor,
          paddingVertical: verticalSpacing,
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Animatable.Text
          ref={this.props.vm.handleExactDateViewRef}
          style={{
            color:
              this.props.vm.datePickerValue && !!this.props.vm.date
                ? sharedColors.textColor
                : sharedColors.placeholderColor,
            fontFamily: fonts.SFProTextRegular,
            fontSize: fontSize,
          }}
        >
          {this.props.vm.datePickerValue && !!this.props.vm.date
            ? this.props.vm.datePickerValue
            : translate('addTodoDay')}
        </Animatable.Text>
        <CustomIcon
          name="chevron_right_outline_28"
          color={sharedColors.borderColor}
          size={24}
        />
      </TouchableOpacity>
    )
  }
}

@observer
class MonthRow extends Component<{
  vm: TodoVM
}> {
  render() {
    return (
      <TouchableOpacity
        disabled={
          !sharedOnboardingStore.tutorialIsShown &&
          !(
            sharedOnboardingStore.step === TutorialStep.BreakdownTodoAction ||
            sharedOnboardingStore.step === TutorialStep.SelectDate
          )
        }
        onPress={() => {
          if (!sharedOnboardingStore.tutorialIsShown) {
            if (sharedOnboardingStore.step === TutorialStep.SelectDate) {
              sharedOnboardingStore.nextStep(TutorialStep.SelectDateNotAllowed)
              return
            }
          }
          this.props.vm.showMonthAndYearPicker =
            !this.props.vm.showMonthAndYearPicker
          if (!!this.props.vm.date) {
            this.props.vm.monthAndYear = undefined
            this.props.vm.date = undefined
          }
          this.props.vm.showDatePicker = false
          if (
            !this.props.vm.monthAndYear &&
            this.props.vm.showMonthAndYearPicker
          ) {
            this.props.vm.monthAndYear = getDateMonthAndYearString(
              moment().add(1, 'month').toDate()
            )
          }
        }}
        style={{
          borderColor: sharedColors.placeholderColor,
          paddingVertical: verticalSpacing,
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Animatable.Text
          ref={this.props.vm.handleMonthViewRef}
          style={{
            color:
              this.props.vm.monthAndYearPickerValueString && !this.props.vm.date
                ? sharedColors.textColor
                : sharedColors.placeholderColor,
            fontFamily: fonts.SFProTextRegular,
            fontSize: fontSize,
          }}
        >
          {this.props.vm.monthAndYearPickerValueString && !this.props.vm.date
            ? this.props.vm.monthAndYearPickerValueString
            : translate('addTodoMonth')}
        </Animatable.Text>
        <CustomIcon
          name="chevron_right_outline_28"
          color={sharedColors.borderColor}
          size={24}
        />
      </TouchableOpacity>
    )
  }
}

@observer
class TimeRow extends Component<{
  vm: TodoVM
}> {
  render() {
    return (
      <View
        style={{
          borderColor: sharedColors.placeholderColor,
          paddingVertical: verticalSpacing,
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            color: this.props.vm.time
              ? sharedColors.textColor
              : sharedColors.placeholderColor,
            flex: 1,
            fontFamily: fonts.SFProTextRegular,
            fontSize: fontSize,
          }}
          onPress={() => {
            if (!this.props.vm.time) {
              this.props.vm.timePickerValue = new Date()
            }
            this.props.vm.showTimePicker = !this.props.vm.showTimePicker
          }}
        >
          {this.props.vm.time ? this.props.vm.time : translate('addTodoTime')}
        </Text>
        <View style={{ flexDirection: 'row' }}>
          {!!this.props.vm.time && (
            <TouchableOpacity
              onPress={() => {
                this.props.vm.time = undefined
              }}
            >
              <Icon
                type="MaterialIcons"
                name="close"
                style={{
                  color: sharedColors.borderColor,
                  fontSize: 24,
                }}
              />
            </TouchableOpacity>
          )}
          <CustomIcon
            name="chevron_right_outline_28"
            color={sharedColors.borderColor}
            size={24}
          />
        </View>
      </View>
    )
  }
}

@observer
class DelegationRow extends Component<{ vm: TodoVM }> {
  render() {
    return (
      <View
        style={{
          borderColor: sharedColors.placeholderColor,
          paddingVertical: verticalSpacing,
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            color: this.props.vm.delegate
              ? sharedColors.textColor
              : sharedColors.placeholderColor,
            flex: 1,
            fontFamily: fonts.SFProTextRegular,
            fontSize: fontSize,
          }}
          onPress={async () => {
            if (!sharedOnboardingStore.tutorialIsShown) return
            const delegates = await sharedDelegationStore.delegates.fetch()
            const options = delegates
              .map((delegate) => {
                if (delegate._id === sharedSessionStore.user?._id) return null
                return delegate.name
              })
              .filter((delegate) => !!delegate)
              .concat([translate('cancel')]) as string[]
            ActionSheet.show(
              {
                options: options,
                title: translate('delegate.to'),
                cancelButtonIndex: options.length,
                destructiveButtonIndex: options.length,
              },
              (buttonIndex) => {
                if (buttonIndex + 1 !== options.length)
                  this.props.vm.delegate = delegates[buttonIndex]
              }
            )
          }}
        >
          {this.props.vm.delegate?.name ||
            translate('delegate.pickDelegateField')}
        </Text>
        <View style={{ flexDirection: 'row' }}>
          {!!this.props.vm.delegate && (
            <TouchableOpacity
              onPress={() => {
                this.props.vm.delegate = undefined
              }}
            >
              <Icon
                type="MaterialIcons"
                name="close"
                style={{
                  color: sharedColors.borderColor,
                  fontSize: 24,
                }}
              />
            </TouchableOpacity>
          )}
          <CustomIcon
            name="chevron_right_outline_28"
            color={sharedColors.borderColor}
            size={24}
          />
        </View>
      </View>
    )
  }
}

@observer
export class SwitchRow extends Component<{
  name: string
  value: boolean
  onValueChange: (value: boolean) => void
}> {
  render() {
    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          borderColor: sharedColors.placeholderColor,
          alignItems: 'center',
          paddingVertical: verticalSpacing,
        }}
      >
        <Text
          style={{
            color: sharedColors.textColor,
            fontFamily: fonts.SFProTextRegular,
            fontSize: fontSize,
          }}
        >
          {this.props.name}
        </Text>
        <Switch
          value={this.props.value}
          onValueChange={this.props.onValueChange}
          thumbColor={Platform.OS === 'android' ? 'lightgrey' : undefined}
          trackColor={{ false: 'grey', true: sharedColors.primaryColor }}
        />
      </View>
    )
  }
}

@observer
export class AddTodoForm extends Component<{
  vm: TodoVM
  deleteTodo?: () => void
  drag?: () => void
  showCross: boolean
}> {
  @computed get minDate() {
    const now = new Date()
    const today = new Date()
    const startTimeOfDay = sharedSettingsStore.startTimeOfDaySafe
    today.setHours(parseInt(startTimeOfDay.substr(0, 2)))
    today.setMinutes(parseInt(startTimeOfDay.substr(3)))

    if (now < today) {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      return yesterday
    } else {
      return new Date()
    }
  }

  UNSAFE_componentWillMount() {
    makeObservable(this)
  }

  @observable isVisible = false

  render() {
    return (
      <>
        {this.props.vm.collapsed ? (
          <CollapsedTodo
            deleteTodo={this.props.deleteTodo}
            vm={this.props.vm}
            drag={this.props.drag}
          />
        ) : (
          <View
            style={{ paddingHorizontal: 16, paddingVertical: verticalSpacing }}
          >
            <TextRow vm={this.props.vm} showCross={this.props.showCross} />
            <TagsRow vm={this.props.vm} />
            <View
              onLayout={({ nativeEvent: { target } }: any) => {
                dateRowNodeId = target as number
              }}
            >
              <DateRow vm={this.props.vm} />
              {this.props.vm.showDatePicker && (
                <Calendar
                  minDate={__DEV__ ? undefined : getDateString(this.minDate)}
                  current={this.props.vm.datePickerValue || new Date()}
                  markedDates={this.props.vm.markedDate}
                  onDayPress={(day) => {
                    this.props.vm.datePickerValue = day.dateString
                    this.props.vm.showDatePicker = false
                  }}
                  theme={{
                    backgroundColor: sharedColors.backgroundColor,
                    calendarBackground: sharedColors.backgroundColor,
                    selectedDayBackgroundColor: 'dodgerblue',
                    textDisabledColor: sharedColors.placeholderColor,
                    dayTextColor: sharedColors.textColor,
                    textSectionTitleColor: sharedColors.textColor,
                    monthTextColor: sharedColors.textColor,
                  }}
                  firstDay={sharedSettingsStore.firstDayOfWeekSafe}
                  hideArrows={false}
                  renderArrow={(direction) =>
                    direction === 'left' ? (
                      <Icon
                        type="MaterialIcons"
                        name="keyboard-arrow-left"
                        style={{
                          color: sharedColors.textColor,
                        }}
                      />
                    ) : (
                      <Icon
                        type="MaterialIcons"
                        name="keyboard-arrow-right"
                        style={{
                          color: sharedColors.textColor,
                        }}
                      />
                    )
                  }
                />
              )}
              <MonthRow vm={this.props.vm} />
            </View>
            {this.props.vm.showMonthAndYearPicker && (
              <MonthPicker
                localeLanguage={sharedSettingsStore.language?.substr(0, 2)}
                selectedDate={this.props.vm.monthAndYearPickerValue}
                onMonthChange={(date: Moment) => {
                  this.props.vm.monthAndYearPickerValue = date.toDate()
                }}
                minDate={moment().add(1, 'month')}
                maxDate={moment().add(100, 'years')}
                containerStyle={{
                  backgroundColor: sharedColors.backgroundColor,
                }}
                monthTextStyle={sharedColors.textExtraStyle.style}
                yearTextStyle={sharedColors.textExtraStyle.style}
                selectedBackgroundColor={sharedColors.primaryColor}
                selectedMonthTextStyle={{
                  color: sharedColors.invertedTextColor,
                }}
                monthDisabledStyle={{ color: sharedColors.placeholderColor }}
                seperatorColor={sharedColors.placeholderColor}
                nextIcon={
                  <Icon
                    type="MaterialIcons"
                    name="keyboard-arrow-right"
                    style={{
                      color: sharedColors.textColor,
                    }}
                  />
                }
                prevIcon={
                  <Icon
                    type="MaterialIcons"
                    name="keyboard-arrow-left"
                    style={{
                      color: sharedColors.textColor,
                    }}
                  />
                }
                initialView={moment().add(1, 'month')}
              />
            )}
            {((sharedSettingsStore.showMoreByDefault &&
              sharedOnboardingStore.tutorialIsShown) ||
              this.props.vm.showMore) && (
              <View>
                <TimeRow vm={this.props.vm} />
                {sharedSessionStore.user &&
                  !!sharedDelegationStore.delegatesCount &&
                  !this.props.vm.editedTodo && (
                    <DelegationRow vm={this.props.vm} />
                  )}
              </View>
            )}
            {this.props.vm.showTimePicker && (
              <DateTimePicker
                textColor={sharedColors.textColor}
                value={this.props.vm.timePickerValue || new Date()}
                mode="time"
                onChange={(event: { type: string }, date: Date | undefined) => {
                  if (Platform.OS === 'android') {
                    this.props.vm.showTimePicker = false
                  }
                  if (event.type === 'set' || Platform.OS === 'ios') {
                    this.props.vm.timePickerValue = date
                    if (
                      !this.props.vm.datePickerValue &&
                      !this.props.vm.monthAndYearPickerValue
                    ) {
                      this.props.vm.datePickerValue = getDateString(new Date())
                    }
                  }
                }}
              />
            )}
            <View
              onLayout={({ nativeEvent: { target } }: any) => {
                frogRowNodeId = target
              }}
            >
              <SwitchRow
                name={translate('todo.create.frog')}
                value={this.props.vm.frog}
                onValueChange={(value) => {
                  this.props.vm.frog = value
                  if (sharedOnboardingStore.tutorialIsShown) return
                  if (sharedOnboardingStore.step === TutorialStep.SelectFrog) {
                    sharedOnboardingStore.nextStep()
                  }
                }}
              />
            </View>
            {(this.props.vm?.editedTodo?.delegator?._id !==
              sharedSessionStore.user?._id ||
              !this.props.vm?.editedTodo?.delegator) && (
              <View
                pointerEvents={
                  sharedOnboardingStore.tutorialIsShown ||
                  sharedOnboardingStore.step ===
                    TutorialStep.BreakdownTodoAction ||
                  sharedOnboardingStore.step === TutorialStep.SelectCompleted
                    ? 'auto'
                    : 'none'
                }
                onLayout={({ nativeEvent: { target } }: any) => {
                  completedRowNodeId = target
                }}
              >
                <SwitchRow
                  name={translate('completed')}
                  value={this.props.vm.completed}
                  onValueChange={(value) => {
                    if (!sharedOnboardingStore.tutorialIsShown) {
                      sharedOnboardingStore.nextStep(
                        TutorialStep.BreakdownCompletedTodo
                      )
                      this.props.vm.completed = false
                      return
                    }
                    this.props.vm.completed = value
                    if (
                      sharedSessionStore.user &&
                      this.props.vm.editedTodo?.delegator?._id !==
                        sharedSessionStore.user?._id &&
                      !this.props.vm.editedTodo?.delegateAccepted
                    ) {
                      this.props.vm.delegateAccepted = value
                    }
                  }}
                />
              </View>
            )}
            {(sharedSettingsStore.showMoreByDefault ||
              this.props.vm.showMore) && (
              <SwitchRow
                name={translate('breakdownMessage.title')}
                value={this.props.vm.repetitive}
                onValueChange={(value) => {
                  this.props.vm.repetitive = value
                }}
              />
            )}
            {((sharedSettingsStore.showMoreByDefault &&
              sharedOnboardingStore.tutorialIsShown) ||
              this.props.vm.showMore) &&
              !this.props.vm.editedTodo && (
                <SwitchRow
                  name={translate('addTodoOnTop')}
                  value={this.props.vm.addOnTop}
                  onValueChange={(value) => {
                    this.props.vm.addOnTop = value
                  }}
                />
              )}
            {(!sharedSettingsStore.showMoreByDefault ||
              !sharedOnboardingStore.tutorialIsShown) &&
              !this.props.vm.showMore && (
                <TouchableOpacity
                  disabled={
                    !sharedOnboardingStore.tutorialIsShown &&
                    !(
                      sharedOnboardingStore.step === TutorialStep.ShowMore ||
                      sharedOnboardingStore.step ===
                        TutorialStep.BreakdownTodoAction
                    )
                  }
                  onLayout={({ nativeEvent: { target } }: any) => {
                    showMoreRowNodeId = target
                  }}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingVertical: verticalSpacing,
                    alignItems: 'center',
                    opacity: sharedSettingsStore.isDark ? 0.8 : undefined,
                  }}
                  onPress={() => {
                    this.props.vm.showMore = true
                    if (sharedOnboardingStore.tutorialIsShown) return
                    if (sharedOnboardingStore.step === TutorialStep.ShowMore) {
                      sharedOnboardingStore.nextStep()
                    }
                  }}
                >
                  <Text
                    style={{
                      color: sharedColors.primaryColor,
                      flex: 1,
                      fontSize,
                    }}
                  >
                    {translate('addTodoMore')}
                  </Text>
                  <CustomIcon
                    name="chevron_right_outline_28"
                    color={sharedColors.primaryColor}
                    size={24}
                  />
                </TouchableOpacity>
              )}
            {!!this.props.deleteTodo && (
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingVertical: verticalSpacing,
                  alignItems: 'center',
                  opacity: sharedSettingsStore.isDark ? 0.8 : undefined,
                }}
                onPress={() => {
                  if (this.props.deleteTodo) {
                    this.props.deleteTodo()
                  }
                }}
              >
                <Text
                  style={{
                    color: sharedColors.primaryColor,
                    flex: 1,
                    fontSize,
                  }}
                >
                  {translate('delete')}
                </Text>
                <CustomIcon
                  name="chevron_right_outline_28"
                  color={sharedColors.primaryColor}
                  size={24}
                />
              </TouchableOpacity>
            )}
          </View>
        )}
      </>
    )
  }
}
