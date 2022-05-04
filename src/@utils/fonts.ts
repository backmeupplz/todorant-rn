import { Platform } from 'react-native'

const fonts = {
  SFProDisplayMedium: 'SF-Pro-Display-Medium',
  SFProDisplayBold: 'SF-Pro-Display-Bold',
  SFProRoundedRegular: 'SF-Pro-Rounded-Regular',
  SFProRoundedBold: 'SF-Pro-Rounded-Bold',
  SFProTextRegular: 'SF-Pro-Text-Regular',
}

if (Platform.OS !== 'android') {
  fonts.SFProDisplayMedium = 'SFProDisplay-Medium'
  fonts.SFProDisplayBold = 'SFProDisplay-Bold'
  fonts.SFProRoundedRegular = 'SFProRounded-Regular'
  fonts.SFProRoundedBold = 'SFProRounded-Bold'
  fonts.SFProTextRegular = 'SFProText-Regular'
}

export default fonts
