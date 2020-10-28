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

struct BackgroundBlurModifier: ViewModifier {
  func body(content: Content) -> some View {
    content
      .blur(radius: Config.backgroundBlurRadius)
  }
}

extension View {
  func todoTextStyle() -> some View {
    modifier(TodoTextModifier())
  }
  
  func backgroundBlurStyle() -> some View {
    modifier(BackgroundBlurModifier())
  }
}

fileprivate enum Config {
  static let textBackgroundColor: Color = .textBackground
  static let textFrameCornerRadius: CGFloat = 10
  static let actionButtonBackground: Color = .actionButtonBackground
  static let actionButtonFrameCorenrRadius: CGFloat = 22
  static let backgroundBlurRadius: CGFloat = 20
}
