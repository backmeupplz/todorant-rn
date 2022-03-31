import { Alert, AlertButton } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { alertSupport } from '@utils/alert'
import { navigationRef } from '@utils/navigation'
import { observer } from 'mobx-react'
import { sharedColors } from '@utils/sharedColors'
import { translate } from '@utils/i18n'
import CustomIcon from '@components/CustomIcon'
import React, { Component } from 'react'

export let infoButtonNodeId: number

@observer
export class InfoButtonContent extends Component<{
  message: string
  extraButtons?: AlertButton[]
  tintColor?: string
}> {
  render() {
    return (
      <TouchableOpacity
        onLayout={({ nativeEvent: { target } }: any) => {
          if (navigationRef.current?.getCurrentRoute()?.name !== 'Settings')
            return
          infoButtonNodeId = target
        }}
        style={{
          marginRight: 12,
        }}
        onPress={() => {
          setTimeout(() => {
            Alert.alert(translate('infoTitle'), translate(this.props.message), [
              ...(this.props.extraButtons || []),
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
        }}
      >
        <CustomIcon
          name="-Icon-1"
          color={sharedColors.textColor}
          size={28}
          style={{ opacity: 0.5 }}
        />
      </TouchableOpacity>
    )
  }
}

export const InfoButton =
  (message: string, extraButtons?: AlertButton[], tintColor?: string) => () =>
    (
      <InfoButtonContent
        message={message}
        extraButtons={extraButtons}
        tintColor={tintColor}
      />
    )
