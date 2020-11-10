//
//  SwipeRecognizer.swift
//  Todorant
//
//  Created by Яков Карпов on 30.10.2020.
//  Copyright © 2020 Facebook. All rights reserved.
//

import SwiftUI

struct SwipeRecognizer {
  static func isDownSwipe(value: DragGesture.Value) -> Bool {
    value.translation.height > 0 && value.translation.width < 100 && value.translation
      .width > -100
  }

  static func isUpSwipe(value: DragGesture.Value) -> Bool {
    value.translation.height < 0 && value.translation.width < 100 && value.translation
      .width > -100
  }

  static let defaultDragGesture = DragGesture(minimumDistance: 3.0, coordinateSpace: .local)
}
