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
      .clipShape(ContainerRelativeShape())
      .padding()
  }
}


fileprivate enum Config {
  static let textBackgroundColor: Color = .textBackground
}
