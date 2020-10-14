import React, { Component } from 'react'
import { ActionSheet, Container, View, Toast } from 'native-base'
import { observer } from 'mobx-react'
import { sharedSessionStore } from '@stores/SessionStore'
import CodePush from 'react-native-code-push'
import { BottomControls } from '@views/settings/intro/BottomControls'
import { Dimensions, ScrollView } from 'react-native'
import { sharedColors } from '@utils/sharedColors'
import { observable } from 'mobx'
import { ImageAndTextIntroPage } from '@views/settings/intro/ImageAndTextIntroPage'
import { translate } from '@utils/i18n'
import { goBack, navigate } from '@utils/navigation'
import { SafeAreaView } from 'react-native-safe-area-context'

const avatar = require('@assets/images/nikita.jpg')

@observer
export class IntroMessage extends Component {
  pages = [
    <ImageAndTextIntroPage
      image={avatar}
      texts={[
        translate('introText0'),
        translate('introText1'),
        translate('introText2'),
      ]}
    />,
    <ImageAndTextIntroPage
      index="1"
      texts={[
        translate('introText3'),
        translate('introText4'),
        translate('introText5'),
      ]}
    />,
    <ImageAndTextIntroPage
      index="2"
      texts={[
        translate('introText6'),
        translate('introText7'),
        translate('introText8'),
      ]}
    />,
    <ImageAndTextIntroPage
      index="3"
      texts={[
        translate('introText9'),
        translate('introText10'),
        translate('introText11'),
      ]}
    />,
    <ImageAndTextIntroPage
      index="😋"
      texts={[
        translate('introText12'),
        translate('introText13'),
        translate('introText14'),
        translate('introText15'),
      ]}
    />,
  ]
  @observable index = 0

  @observable width = Dimensions.get('window').width

  scrollViewRef = React.createRef<ScrollView>()

  async componentDidMount() {
    try {
      const updateRequested = await CodePush.checkForUpdate()
      if (!updateRequested) {
        sharedSessionStore.introMessageShown = true
      }
    } catch (err) {
      // Do nothing
      sharedSessionStore.introMessageShown = true
    }
  }

  render() {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: sharedColors.backgroundColor }}
        {...{ edges: ['left', 'bottom', 'right'] }}
      >
        <Container>
          <ScrollView
            ref={this.scrollViewRef}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            pagingEnabled={true}
            onMomentumScrollEnd={(data) => {
              data.eventPhase
              const offset = data.nativeEvent.contentOffset.x
              if (offset < 0) {
                this.index = 0
              } else if (offset > this.width * this.pages.length) {
                this.index = this.pages.length - 1
              } else {
                this.index = Math.round(offset / Dimensions.get('window').width)
              }
            }}
            onContentSizeChange={(w) => {
              this.width = w / this.pages.length
            }}
            style={{
              backgroundColor: sharedColors.backgroundColor,
            }}
            contentContainerStyle={{
              width: `${100 * this.pages.length}%`,
            }}
          >
            {this.pages.map((p, i) => (
              <View style={{ width: this.width }} key={i}>
                {p}
              </View>
            ))}
          </ScrollView>
          <View style={{ height: 50 }}>
            <BottomControls
              count={this.pages.length}
              index={this.index}
              indexChanged={(index) => {
                if (index < 0 || index > this.pages.length - 1) {
                  return
                }
                this.index = index
                this.scrollViewRef.current?.scrollTo({
                  x: this.width * this.index,
                })
              }}
              letsGoAction={() => {
                ActionSheet.show(
                  {
                    options: [
                      translate('startUsingNow'),
                      translate('readRulesFirst'),
                    ],
                    title: translate('whatWouldYouLikeToDoa'),
                  },
                  (index) => {
                    if (index === 0) {
                      goBack()
                    } else {
                      goBack()
                      navigate('Rules')
                    }
                    Toast.show({
                      text: translate(
                        index === 0 ? 'iAdmireYourBravery' : 'iAdmireYourSpirit'
                      ),
                      duration: 3000,
                    })
                  }
                )
              }}
            />
          </View>
        </Container>
      </SafeAreaView>
    )
  }
}
