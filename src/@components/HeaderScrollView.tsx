import {
  Animated,
  Dimensions,
  NativeScrollEvent,
  NativeScrollPoint,
  NativeSyntheticEvent,
  FlatList as RNFLatList,
  StyleProp,
  Text,
  View,
  ViewStyle,
} from 'react-native'
import { Component } from 'react'
import { FlatList } from 'react-native-gesture-handler'
import { HeroButton } from '@components/HeroButton'
import { InfoButton } from '@components/InfoButton'
import { Ref } from 'react'
import { TutorialStep } from '@stores/OnboardingStore/TutorialStep'
import { ifIphoneX } from 'react-native-iphone-x-helper'
import { makeObservable, observable } from 'mobx'
import { observer } from 'mobx-react'
import { sharedColors } from '@utils/sharedColors'
import { sharedOnboardingStore } from '@stores/OnboardingStore'
import { sharedSettingsStore } from '@stores/SettingsStore'
import Fade from '@components/Fade'
import React from 'react'
import fonts from '@utils/fonts'

export let infoButtonNodeId: number

const headerHeight = ifIphoneX(88, 60)
const { height } = Dimensions.get('window')

@observer
export class HeaderScrollView extends Component<{
  title: string
  showsHeroButton?: boolean
  infoTitle: string
  contentContainerStyle?: StyleProp<ViewStyle>
  onscrollViewRef?: Ref<RNFLatList<unknown>> | undefined
  onScrollViewContentRef?: (event: View) => void
  onOffsetChange?: (offset: NativeScrollPoint) => void
}> {
  @observable headerHeight = 0
  @observable headerY = 0
  @observable isHeaderScrolled = false

  scrollAnimatedValue = new Animated.Value(0)

  UNSAFE_componentWillMount() {
    makeObservable(this)
  }

  render() {
    const fontSize = 34
    const titleStyles = {
      fontSize,
      lineHeight: fontSize * 1.2,
      letterSpacing: 0.011,
      fontFamily: fonts.SFProDisplayBold,
      marginLeft: 16,
    }

    const animatedFontSize = this.scrollAnimatedValue.interpolate({
      inputRange: [-height, 0],
      outputRange: [fontSize * 1.75, fontSize],
      extrapolate: 'clamp',
    })

    return (
      <View
        style={{ flex: 1, backgroundColor: 'transparent' }}
        pointerEvents={
          sharedOnboardingStore.tutorialIsShown ||
          sharedOnboardingStore.step === TutorialStep.Breakdown
            ? 'auto'
            : 'none'
        }
      >
        <View
          style={{
            height: headerHeight,
            backgroundColor: sharedColors.backgroundColor,
          }}
        >
          <Fade visible={this.isHeaderScrolled}>
            <View
              style={{
                height: headerHeight,
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingBottom: 12,
                borderBottomColor: sharedSettingsStore.isDark
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'rgba(0, 0, 0, 0.1)',
                borderBottomWidth: 1,
              }}
            >
              <Text
                style={{
                  fontSize: 17,
                  lineHeight: 22,
                  fontWeight: '500',
                  letterSpacing: 0.019,
                  color: sharedColors.textColor,
                }}
              >
                {this.props.title}
              </Text>
              {!!this.props.infoTitle && (
                <View
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    flex: 1,
                    height: '100%',
                    alignContent: 'center',
                    justifyContent: 'flex-end',
                    paddingHorizontal: 12,
                  }}
                >
                  {InfoButton(this.props.infoTitle)()}
                </View>
              )}
            </View>
          </Fade>
        </View>
        <FlatList
          data={[]}
          ref={this.props.onscrollViewRef}
          onScroll={(event) => {
            Animated.event(
              [
                {
                  nativeEvent: {
                    contentOffset: { y: this.scrollAnimatedValue },
                  },
                },
              ],
              {
                listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
                  const offset = event.nativeEvent.contentOffset.y
                  const scrollHeaderOffset =
                    this.headerHeight + this.headerY - 8
                  const isHeaderScrolled = scrollHeaderOffset < offset
                  if (!this.isHeaderScrolled && isHeaderScrolled) {
                    this.isHeaderScrolled = isHeaderScrolled
                  }
                  if (this.isHeaderScrolled && !isHeaderScrolled) {
                    this.isHeaderScrolled = isHeaderScrolled
                  }
                },
                useNativeDriver: false,
              }
            )(event)
            if (this.props.onOffsetChange) {
              this.props.onOffsetChange(event.nativeEvent.contentOffset)
            }
          }}
          scrollEventThrottle={8}
          style={{
            backgroundColor: sharedColors.backgroundColor,
          }}
          contentContainerStyle={this.props.contentContainerStyle}
          renderItem={null}
          ListHeaderComponent={
            <View ref={this.props.onScrollViewContentRef}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
                pointerEvents={
                  sharedOnboardingStore.tutorialIsShown ? 'auto' : 'none'
                }
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Animated.Text
                    style={[
                      titleStyles,
                      {
                        fontSize: animatedFontSize,
                        color: sharedColors.textColor,
                      },
                    ]}
                    onLayout={(event) => {
                      this.headerHeight = event.nativeEvent.layout.height
                      this.headerY = event.nativeEvent.layout.y
                    }}
                  >
                    {this.props.title}
                  </Animated.Text>
                  {!!this.props.infoTitle && (
                    <View style={{ marginHorizontal: 12 }}>
                      <View
                        onLayout={({ nativeEvent: { target } }: any) => {
                          infoButtonNodeId = target
                        }}
                      >
                        {InfoButton(this.props.infoTitle)()}
                      </View>
                    </View>
                  )}
                </View>
                {this.props.showsHeroButton &&
                  sharedSettingsStore.gamificationOn && <HeroButton />}
              </View>
              {this.props.children}
            </View>
          }
        />
      </View>
    )
  }
}
