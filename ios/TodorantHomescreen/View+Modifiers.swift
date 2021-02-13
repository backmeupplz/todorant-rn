//
//  View+Modifiers.swift
//  TodorantHomescreen
//
//  Created by Яков Карпов on 24.10.2020.
//  Copyright © 2020 Facebook. All rights reserved.
//

import SwiftUI

struct WidgetTodoTextModifier: ViewModifier {
  func body(content: Content) -> some View {
    content
      .frame(maxWidth: .infinity, maxHeight: .infinity)
      .background(Config.mainColor)
      .clipShape(ContainerRelativeShape())
      .padding([.leading, .trailing, .bottom])
  }
}

struct WidgetTitleModifier: ViewModifier {
  func body(content: Content) -> some View {
    content
      .font(.title)
      .widgetTopElementPadding() 
  }
}

struct WidgetTopElementModifier: ViewModifier {
  func body(content: Content) -> some View {
    content
      .padding([.leading, .trailing])
      .padding(.top, Config.topElementPadding)
  }
}

struct WidgetWarningTextModifier: ViewModifier {
  func body(content: Content) -> some View {
    content
      .font(.footnote)
      .padding(.top, -15)
      .padding(.bottom, 5)
  }
}

extension View {
  func widgetTextStyle() -> some View {
    modifier(WidgetTodoTextModifier())
  }
  
  func widgetTitleStyle() -> some View {
    modifier(WidgetTitleModifier())
  }
  
  func widgetTopElementPadding() -> some View {
    modifier(WidgetTopElementModifier())
  }
  
  func widgetWarningTextModifier() -> some View {
    modifier(WidgetWarningTextModifier())
  }
}

private enum Config {
  static let topElementPadding: CGFloat = 8
  static let mainColor: Color = .buttonsRowBackground
}
