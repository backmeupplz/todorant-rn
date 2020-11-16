//
//  SwipableNavigationView.swift
//  Todorant
//
//  Created by Яков Карпов on 29.10.2020.
//  Copyright © 2020 Facebook. All rights reserved.
//

import SwiftUI

struct SwipableNavigationView: View {
  @EnvironmentObject var store: Store

  @State private var isShowingButtonsView: Bool = false
  @State private var buttonsViewVerticalOffset = CGSize.zero

  var body: some View {
    ZStack {
      CurrentView(isShowingButtonsView: $isShowingButtonsView)
        .conditionalBackgroundBlurStyle(condition: isShowingButtonsView)
        .onTapGesture {
          store.updateCurrent()
        }
        .onAppear {
          store.updateCurrent()
        }
      if isShowingButtonsView {
        if let todo = store.currentState?.todo, !store.errorShown {
          VStack {
            ButtonsView(todo: todo, isShowingButtonsView: $isShowingButtonsView)
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
}
