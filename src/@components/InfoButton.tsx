import { Alert, AlertButton } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { alertSupport } from '@utils/alert'
import { navigationRef } from '@utils/navigation'
import { observer } from 'mobx-react'
import { sharedColors } from '@utils/sharedColors'
import { translate } from '@utils/i18n'
import CustomIcon from '@components/CustomIcon'
import React, { useRef } from 'react'

export let infoButtonNodeId: number

const InfoButtonContent = observer(({ message, extraButtons, tintColor }) => {
  const targetRef = useRef(null)
  const handleLayout = () => {
    if (navigationRef.current?.getCurrentRoute()?.name !== 'Settings') return
    infoButtonNodeId = targetRef.current
  }

  const handlePress = () => {
    setTimeout(() => {
      Alert.alert(translate('infoTitle'), translate(message), [
        ...(extraButtons || []),
        {
          text: translate('supportLabel'),
          onPress: () => {
            alertSupport()
          },
        },
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        { text: translate('ok'), onPress: () => {} },
      ])
    }, 100)
  }

  return (
    <TouchableOpacity
      ref={targetRef}
      onLayout={handleLayout}
      style={{
        marginRight: 12,
      }}
      onPress={handlePress}
    >
      <CustomIcon
        name="-Icon-1"
        color={sharedColors.textColor}
        size={28}
        style={{ opacity: 0.5 }}
      />
    </TouchableOpacity>
  )
})

export const InfoButton = (message, extraButtons, tintColor) => () =>
  (
    <InfoButtonContent
      message={message}
      extraButtons={extraButtons}
      tintColor={tintColor}
    />
  )
