//
//  SwipableNavigationView.swift
//  Todorant
//
//  Created by Яков Карпов on 29.10.2020.
//  Copyright © 2020 Facebook. All rights reserved.
//

import SwiftUI

struct SwipableNavigationView: View {
  @State private var isShowingButtonsView: Bool = false
  @State private var buttonsViewVerticalOffset = CGSize.zero

  var body: some View {
    ZStack {
      TodoView()
        .conditionalBackgroundBlurStyle(condition: isShowingButtonsView)
        .gesture(SwipeRecognizer.defaultDragGesture
          .onEnded { value in
            if SwipeRecognizer.isDownSwipe(value: value) {
              withAnimation {
                isShowingButtonsView.toggle()
              }
            }
          })
      if isShowingButtonsView {
        VStack {
          ButtonsView()
        }
        .offset(y: buttonsViewVerticalOffset.height)
        .buttonsViewAnimationStyle()
        .gesture(SwipeRecognizer.defaultDragGesture
          .onChanged { value in
            buttonsViewVerticalOffset = value.translation
          }
          .onEnded { value in
            if SwipeRecognizer.isUpSwipe(value: value) {
              withAnimation {
                isShowingButtonsView.toggle()
              }
            }
            buttonsViewVerticalOffset = CGSize.zero
          })
      }
    }
  }
}
