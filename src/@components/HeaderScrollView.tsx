import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
  View,
  ScrollView,
  Text,
  Animated,
  Dimensions,
  StyleSheet,
} from 'react-native'
import { ifIphoneX } from 'react-native-iphone-x-helper'
import Fade from '@components/Fade'
import { observer } from 'mobx-react'
import { InfoButton } from '@components/InfoButton'
import { HeroButton } from '@components/HeroButton'

const headerHeight = ifIphoneX(88, 60)

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  headerContainer: {
    height: headerHeight,
  },
  headline: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '500',
    letterSpacing: 0.019,
  },
  title: {
    letterSpacing: 0.011,
    fontFamily: 'SF-Pro-Display-Bold',
    marginLeft: 16,
  },
})

const { height } = Dimensions.get('window')

@observer
export class HeaderScrollView extends Component {
  static propTypes = {
    title: PropTypes.string,
    titleStyle: PropTypes.object,
    headlineStyle: PropTypes.object,
    children: PropTypes.node,
    containerStyle: PropTypes.object,
    headerContainerStyle: PropTypes.object,
    headerComponentContainerStyle: PropTypes.object,
    scrollContainerStyle: PropTypes.object,
    fadeDirection: PropTypes.string,
    scrollViewProps: PropTypes.object,
    showsHeroButton: PropTypes.bool,
    infoTitle: PropTypes.string,
  }

  static defaultProps = {
    scrollViewProps: {},
    showsHeroButton: false,
  }

  state = {
    headerHeight: 0,
    headerY: 0,
    isHeaderScrolled: false,
    fadeDirection: '',
  }

  onLayout = (event: any) => {
    this.setState({
      headerHeight: event.nativeEvent.layout.height,
      headerY: event.nativeEvent.layout.y,
    })
  }

  scrollAnimatedValue = new Animated.Value(0)

  handleScroll = (event: any) => {
    const offset = event.nativeEvent.contentOffset.y
    const scrollHeaderOffset = this.state.headerHeight + this.state.headerY - 8
    const isHeaderScrolled = scrollHeaderOffset < offset

    if (!this.state.isHeaderScrolled && isHeaderScrolled) {
      this.setState({
        isHeaderScrolled,
      })
    }

    if (this.state.isHeaderScrolled && !isHeaderScrolled) {
      this.setState({
        isHeaderScrolled,
      })
    }
  }

  render() {
    const {
      children,
      title = '',
      titleStyle = {},
      containerStyle = {},
      headerContainerStyle = {},
      headlineStyle = {},
      scrollContainerStyle = {},
      fadeDirection,
      scrollViewProps = {},
      showsHeroButton,
      infoTitle,
    } = this.props as any

    const fontSize = titleStyle.fontSize || 34
    const titleStyles = {
      fontSize,
      lineHeight: fontSize * 1.2,
    }

    const animatedFontSize = this.scrollAnimatedValue.interpolate({
      inputRange: [-height, 0],
      outputRange: [fontSize * 1.75, fontSize],
      extrapolate: 'clamp',
    })

    return (
      <View style={[styles.container, containerStyle]}>
        <View style={[styles.headerContainer, headerContainerStyle]}>
          <Fade visible={this.state.isHeaderScrolled} direction={fadeDirection}>
            <View
              style={{
                height: headerHeight,
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingBottom: 12,
              }}
            >
              <Text style={[styles.headline, headlineStyle]}>{title}</Text>
              {!!infoTitle && (
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
                  {InfoButton(infoTitle)()}
                </View>
              )}
            </View>
          </Fade>
        </View>
        <ScrollView
          onScroll={Animated.event(
            [
              {
                nativeEvent: { contentOffset: { y: this.scrollAnimatedValue } },
              },
            ],
            {
              listener: this.handleScroll,
            }
          )}
          scrollEventThrottle={8}
          contentContainerStyle={scrollContainerStyle}
          {...scrollViewProps}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Animated.Text
                style={[
                  styles.title,
                  titleStyle,
                  titleStyles,
                  {
                    fontSize: animatedFontSize,
                  },
                ]}
                onLayout={this.onLayout}
              >
                {title}
              </Animated.Text>

              {!!infoTitle && (
                <View style={{ marginHorizontal: 12 }}>
                  {InfoButton(infoTitle)()}
                </View>
              )}
            </View>
            {showsHeroButton && <HeroButton />}
          </View>
          {children}
        </ScrollView>
      </View>
    )
  }
}
