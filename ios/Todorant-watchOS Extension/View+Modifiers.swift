//
//  View+Modifiers.swift
//  Todorant
//
//  Created by Яков Карпов on 28.10.2020.
//  Copyright © 2020 Facebook. All rights reserved.
//

import SwiftUI

struct TodoTextModifier: ViewModifier {
  func body(content: Content) -> some View {
    content
      .frame(maxWidth: .infinity, maxHeight: .infinity)
      .background(Config.textBackgroundColor)
      .cornerRadius(Config.textFrameCornerRadius)
  }
}

struct ConditionalBackgroundBlurModifier: ViewModifier {
  let condition: Bool
  func body(content: Content) -> some View {
    content
      .blur(radius: condition ? Config.backgroundBlurRadius : 0)
      .scaleEffect(condition ? Config.backgroundDownscaleAmount : 1)
  }
}

struct ButtonsViewAnimationModifier: ViewModifier {
  func body(content: Content) -> some View {
    content
      .transition(.move(edge: .top))
      .animation(.spring())
  }
}

extension View {
  func todoTextStyle() -> some View {
    modifier(TodoTextModifier())
  }

  func conditionalBackgroundBlurStyle(condition: Bool) -> some View {
    modifier(ConditionalBackgroundBlurModifier(condition: condition))
  }

  func buttonsViewAnimationStyle() -> some View {
    modifier(ButtonsViewAnimationModifier())
  }
}

private enum Config {
  static let textBackgroundColor: Color = .textBackground
  static let textFrameCornerRadius: CGFloat = 15
  static let actionButtonBackground: Color = .actionButtonBackground
  static let actionButtonFrameCorenrRadius: CGFloat = 22
  static let backgroundBlurRadius: CGFloat = 20
  static let backgroundDownscaleAmount: CGFloat = 0.85
}
