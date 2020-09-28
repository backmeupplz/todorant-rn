import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { observable, computed } from 'mobx'
import { getDelegateInfo, resetDelegateToken } from '@utils/rest'
import { TableItem } from '@components/TableItem'
import { Clipboard } from 'react-native'
import { Text, Icon, Toast, View, ActionSheet } from 'native-base'
import { translate } from '@utils/i18n'
import { sharedColors } from '@utils/sharedColors'
import { TouchableOpacity } from 'react-native-gesture-handler'

@observer
export class DelegationSettings extends Component {
  @observable token = ''
  @observable reset = false

  @computed get delegateInviteLink() {
    return `https://todorant.com/invite/${this.token}`
  }

  async getDelegateToken() {
    const token = (await getDelegateInfo()).token
    this.token = token
    return
  }
  async resetDelegateToken() {
    const token = await resetDelegateToken()
    this.token = token
    return
  }
  componentDidMount() {
    this.getDelegateToken()
  }

  render() {
    return (
      <>
        <TableItem
          onPress={async () => {
            if (!this.reset) {
              Clipboard.setString(`${this.delegateInviteLink}`)
              Toast.show({
                text: `"${this.delegateInviteLink}" ${translate('copied')}`,
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
              }}
            >
              {`${this.delegateInviteLink.substr(0, 30)}...`}
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
      </>
    )
  }
}
