import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { makeObservable, observable } from 'mobx'
import { resetDelegateToken } from '@utils/rest'
import { TableItem } from '@components/TableItem'
import { Clipboard } from 'react-native'
import { Text, Icon, Toast, View, ActionSheet } from 'native-base'
import { translate } from '@utils/i18n'
import { sharedColors } from '@utils/sharedColors'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { sharedSessionStore } from '@stores/SessionStore'
import { navigate } from '@utils/navigation'
import fonts from '@utils/fonts'
import { DelegationUserType } from '@models/DelegationUser'

@observer
export class DelegationSettings extends Component {
  @observable reset = false
  async resetDelegateToken() {
    sharedSessionStore.user!.delegateInviteToken = await resetDelegateToken()
  }

  UNSAFE_componentWillMount() {
    makeObservable(this)
  }

  render() {
    return (
      <>
        <TableItem
          onPress={async () => {
            if (!this.reset) {
              Clipboard.setString(`${sharedSessionStore.delegateInviteLink}`)
              Toast.show({
                text: `"${sharedSessionStore.delegateInviteLink}" ${translate(
                  'copied'
                )}`,
              })
            }
            this.reset = false
          }}
        >
          <View style={{ flexDirection: 'column' }}>
            <Text
              style={{
                flex: 1,
                paddingRight: 10,
                ...sharedColors.regularTextExtraStyle.style,
              }}
            >
              {translate('delegate.link')}
            </Text>
            <Text
              style={{
                opacity: 0.4,
                ...sharedColors.regularTextExtraStyle.style,
              }}
            >
              {`${sharedSessionStore.delegateInviteLink.substr(0, 30)}...`}
            </Text>
          </View>
          <TouchableOpacity
            onPress={async () => {
              this.reset = true
              const options = [
                translate('cancel'),
                translate('delegate.resetLink'),
              ]
              ActionSheet.show(
                {
                  options: options,
                  cancelButtonIndex: 0,
                  title: translate('delegate.resetConfirmation'),
                },
                async (buttonIndex) => {
                  if (buttonIndex === 0) {
                  } else {
                    await this.resetDelegateToken()
                  }
                }
              )
            }}
          >
            <Icon
              type="MaterialIcons"
              name="refresh"
              style={{
                paddingLeft: 10,
                color: sharedColors.borderColor,
                fontSize: 24,
                top: '2%',
              }}
            />
          </TouchableOpacity>
        </TableItem>
        <TableItem
          onPress={() => {
            navigate('Delegators', {
              delegationType: DelegationUserType.delegator,
            })
          }}
        >
          <Text
            style={{
              color: sharedColors.textColor,
              fontFamily: fonts.SFProTextRegular,
            }}
          >
            {translate('delegate.delegators')}
          </Text>
        </TableItem>
        <TableItem
          onPress={() => {
            navigate('Delegates', {
              delegationType: DelegationUserType.delegate,
            })
          }}
        >
          <Text
            style={{
              color: sharedColors.textColor,
              fontFamily: fonts.SFProTextRegular,
            }}
          >
            {translate('delegate.delegates')}
          </Text>
        </TableItem>
      </>
    )
  }
}
