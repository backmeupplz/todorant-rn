import React, { Component } from 'react'
import { Text, Toast, Input, Icon } from 'native-base'
import { observer } from 'mobx-react'
import { sharedSessionStore } from '@stores/SessionStore'
import { SubscriptionSection } from '@views/settings/SubscriptionSection'
import { translate } from '@utils/i18n'
import { sharedColors } from '@utils/sharedColors'
import { Clipboard, Platform } from 'react-native'
import { SectionHeader } from '@components/SectionHeader'
import { TableItem } from '@components/TableItem'
import fonts from '@utils/fonts'
import { makeObservable, observable } from 'mobx'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { setUserName } from '@utils/rest'
import { alertError } from '@utils/alert'
import { Spinner } from '@components/Spinner'

@observer
class InfoRow extends Component<{ title: string; value: string }> {
  render() {
    return (
      <TableItem
        {...sharedColors.listItemExtraStyle}
        onPress={() => {
          Clipboard.setString(this.props.value)
          Toast.show({ text: `"${this.props.value}" ${translate('copied')}` })
        }}
      >
        <Text {...sharedColors.regularTextExtraStyle}>{this.props.title}</Text>
        <Text
          style={{
            ...sharedColors.regularTextExtraStyle.style,
            flexWrap: 'wrap',
          }}
        >
          {this.props.value.length <= 30
            ? this.props.value
            : `${this.props.value.substr(0, 30)}...`}
        </Text>
      </TableItem>
    )
  }
}

@observer
export class AccountInfo extends Component {
  @observable loading = false
  @observable name = ''
  @observable nameChangingMenu = false

  UNSAFE_componentWillMount() {
    makeObservable(this)
  }

  render() {
    return !sharedSessionStore.user ? (
      <>
        <SectionHeader title={translate('account')} />
        <TableItem>
          <Text {...sharedColors.regularTextExtraStyle}>
            {translate('anonymousText')}
          </Text>
        </TableItem>
      </>
    ) : (
      <>
        <SectionHeader title={translate('account')} />
        {this.loading && (
          <TableItem>
            <Spinner />
          </TableItem>
        )}
        {!this.nameChangingMenu && (
          <TableItem
            {...sharedColors.listItemExtraStyle}
            onPress={() => {
              if (sharedSessionStore.user)
                this.name = sharedSessionStore.user.name
              this.nameChangingMenu = true
            }}
          >
            <Text {...sharedColors.regularTextExtraStyle}>
              {translate('nameLabel')}
            </Text>
            <Text
              style={{
                ...sharedColors.regularTextExtraStyle.style,
                flexWrap: 'wrap',
              }}
            >
              {sharedSessionStore.user.name.length <= 20
                ? sharedSessionStore.user.name
                : `${sharedSessionStore.user.name.substr(0, 20)}...`}
            </Text>
          </TableItem>
        )}
        {this.nameChangingMenu && (
          <TableItem>
            <Input
              multiline
              placeholder={translate('nameLabel')}
              value={this.name}
              onChangeText={(text) => {
                this.name = text.trim()
              }}
              placeholderTextColor={sharedColors.placeholderColor}
              maxLength={250}
              autoFocus
              style={{
                color: sharedColors.textColor,
                fontFamily: fonts.SFProTextRegular,
                fontSize: 18,
                padding: 0,
                paddingLeft: Platform.OS === 'android' ? 1 : undefined,
              }}
              selectionColor={sharedColors.primaryColor}
            />
            <TouchableOpacity
              onPress={async () => {
                if (sharedSessionStore.user)
                  this.name = sharedSessionStore.user.name
                this.nameChangingMenu = false
              }}
              style={{ paddingRight: 8, paddingTop: 5 }}
            >
              <Icon
                type="MaterialIcons"
                name="close"
                style={{
                  color: sharedColors.borderColor,
                  fontSize: 24,
                }}
              ></Icon>
            </TouchableOpacity>
            {!!this.name && this.name != sharedSessionStore.user?.name && (
              <TouchableOpacity
                onPress={async () => {
                  if (this.name) {
                    this.nameChangingMenu = false
                    this.loading = true
                    try {
                      await setUserName(this.name)
                    } catch (err) {
                      alertError(err)
                    } finally {
                      this.loading = false
                    }
                  }
                }}
                style={{ paddingRight: 8, paddingTop: 5 }}
              >
                <Icon
                  type="MaterialIcons"
                  name="done"
                  style={{
                    color: sharedColors.borderColor,
                    fontSize: 24,
                  }}
                ></Icon>
              </TouchableOpacity>
            )}
          </TableItem>
        )}
        {sharedSessionStore.user.email && (
          <InfoRow
            title={translate('email')}
            value={sharedSessionStore.user.email}
          />
        )}
        {sharedSessionStore.user.facebookId && (
          <InfoRow
            title={translate('facebook')}
            value={sharedSessionStore.user.facebookId}
          />
        )}
        {sharedSessionStore.user.telegramId && (
          <InfoRow
            title={translate('telegram')}
            value={sharedSessionStore.user.telegramId}
          />
        )}
        {sharedSessionStore.user.appleSubId && (
          <InfoRow
            title={translate('apple')}
            value={sharedSessionStore.user.appleSubId}
          />
        )}
        <SubscriptionSection />
      </>
    )
  }
}
