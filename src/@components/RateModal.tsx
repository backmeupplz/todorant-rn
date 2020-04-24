import React, { Component } from 'react'
import RateModalExternal from 'react-native-store-rating'
import { sharedSessionStore } from '@stores/SessionStore'
import { sendFeedback } from '@utils/rest'
import { observer } from 'mobx-react'
import { translate } from '@utils/i18n'
import { sharedColors } from '@utils/sharedColors'
import { Alert, Linking, Platform } from 'react-native'

@observer
export class RateModal extends Component {
  render() {
    return (
      <RateModalExternal
        rateBtnText={translate('rate')}
        cancelBtnText={translate('cancel')}
        sendBtnText={translate('send')}
        commentPlaceholderText={translate('rateCommentPlaceholder')}
        emptyCommentErrorMessage={translate('rateCommentEmptyError')}
        iTunesStoreUrl="itms-apps://itunes.apple.com/app/1482078243"
        playStoreUrl="market://details?id=com.todorant"
        isModalOpen={sharedSessionStore.needsToRequestRate}
        storeRedirectThreshold={4}
        modalTitle={translate('rateTitle')}
        starLabels={[
          translate('starTerrible'),
          translate('starBad'),
          translate('starOkay'),
          translate('starGood'),
          translate('starGreat'),
        ]}
        style={{}}
        onStarSelected={() => {}}
        onClosed={() => {
          sharedSessionStore.askedToRate = true
        }}
        sendContactUsForm={(state) => {
          sharedSessionStore.askedToRate = true
          sendFeedback(state)
        }}
        containerStyle={{ backgroundColor: sharedColors.backgroundColor }}
        titleStyle={{ color: sharedColors.textColor }}
        cancelButtonTextStyle={{ color: sharedColors.textColor }}
        cancelButtonContainerStyle={{ borderColor: sharedColors.textColor }}
        rateButtonTextStyle={{ color: sharedColors.backgroundColor }}
        rateButtonContainerStyle={{
          backgroundColor: sharedColors.primaryColor,
        }}
        placeholderTextColor={sharedColors.placeholderColor}
        errorTextStyle={{ color: 'tomato' }}
        textBoxStyle={{ color: sharedColors.textColor }}
        onRated={() => {
          setTimeout(() => {
            Alert.alert(
              '',
              translate(
                Platform.OS === 'android'
                  ? 'rateSolicitationGoogle'
                  : 'rateSolicitationApple'
              ),
              [
                {
                  text: translate('cancel'),
                  style: 'cancel',
                  onPress: () => {
                    sharedSessionStore.askedToRate = true
                  },
                },
                {
                  text: translate('rateButton'),
                  onPress: () => {
                    Linking.openURL(
                      Platform.OS === 'android'
                        ? 'market://details?id=com.todorant'
                        : 'itms-apps://itunes.apple.com/app/1482078243'
                    )
                    sharedSessionStore.askedToRate = true
                  },
                },
              ]
            )
          }, 100)
        }}
      />
    )
  }
}
