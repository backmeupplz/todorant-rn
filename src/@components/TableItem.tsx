import { LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { View } from 'native-base'
import { observer } from 'mobx-react'
import { sharedColors } from '@utils/sharedColors'
import CustomIcon from '@components/CustomIcon'
import React from 'react'

export const TableItem = observer(
  ({
    onPress,
    onLongPress,
    onLayout,
    disableIndents,
    children,
  }: {
    children: React.ReactNode
    onPress?: () => void
    onLongPress?: () => void
    onLayout?: (layout: LayoutChangeEvent) => void
    disableIndents?: boolean
  }) => {
    const renderContent = () => {
      return (
        <View style={{ flexDirection: 'row' }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              flex: 1,
            }}
          >
            {children}
          </View>
          {!!onPress && (
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
              <CustomIcon
                name="chevron_right_outline_28"
                color={sharedColors.borderColor}
                size={24}
              />
            </View>
          )}
        </View>
      )
    }
    const containerStyle = {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: disableIndents ? 0 : 16,
      marginVertical: disableIndents ? 0 : 8,
    } as StyleProp<ViewStyle>

    return onPress ? (
      <TouchableOpacity
        onLayout={onLayout}
        onPress={onPress}
        onLongPress={onLongPress}
        disabled={!onPress}
        style={containerStyle}
      >
        {renderContent()}
      </TouchableOpacity>
    ) : (
      <View style={containerStyle}>{renderContent()}</View>
    )
  }
)
