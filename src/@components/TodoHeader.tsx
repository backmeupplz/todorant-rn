import 'moment/min/locales'
import { IconButton } from '@components/IconButton'
import { Observer } from 'mobx-react'
import { Text, View } from 'native-base'
import { TodoSectionType } from '@stores/AppStateStore'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { capitalizeSentence } from '@utils/capitalizeSentence'
import { navigate } from '@utils/navigation'
import { sharedColors } from '@utils/sharedColors'
import { sharedOnboardingStore } from '@stores/OnboardingStore'
import { sharedSettingsStore } from '@stores/SettingsStore'
import React, { FC, memo, useCallback } from 'react'
import fonts from '@utils/fonts'
import moment from 'moment'

// TODO: figure out how callbacks affect on memo

export const TodoHeader: FC<{
  item: string
  drag?: () => void
  isActive?: boolean
  date?: boolean
  onPlusPress?: () => void
  hidePlus?: boolean
}> = memo((props) => {
  return (
    <Observer>
      {() => {
        const renderDateContent = useCallback(() => {
          return (
            <>
              {props.item}
              {(props.item.length || 0) === 10 &&
                `, ${capitalizeSentence(
                  moment(props.item)
                    .locale(sharedSettingsStore.language || 'en')
                    .format('dddd')
                )}`}
            </>
          )
        }, [])

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
                  sharedAppStateStore.todoSection ===
                    TodoSectionType.planning &&
                  sharedOnboardingStore.tutorialIsShown
                    ? props.drag
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
                      marginLeft: props.isActive ? 30 : 16,
                      marginRight: 12,
                      fontFamily: fonts.SFProRoundedRegular,
                    }}
                  >
                    {props.date ? renderDateContent() : props.item}
                  </Text>
                </View>
              </TouchableOpacity>
              {!props.hidePlus && (
                <IconButton
                  disabled={!sharedOnboardingStore.tutorialIsShown}
                  onPress={() => {
                    props.onPlusPress
                      ? props.onPlusPress()
                      : navigate('AddTodo', {
                          date: props.item,
                        })
                  }}
                  size={20}
                  name="add_outline_28"
                  color={sharedColors.primaryColor}
                />
              )}
            </View>
          </View>
        )
      }}
    </Observer>
  )
})
