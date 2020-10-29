//
//  SwipableNavigationView.swift
//  Todorant
//
//  Created by Яков Карпов on 29.10.2020.
//  Copyright © 2020 Facebook. All rights reserved.
//

import SwiftUI

struct SwipableNavigationView: View {
  @State private var isShowingButtons: Bool = false

  var body: some View {
    ZStack {
      TodoView()
        .conditionalBackgroundBlurStyle(condition: isShowingButtons)
        .onTapGesture {
          withAnimation {
            isShowingButtons.toggle()
          }
        }
      if isShowingButtons {
        ButtonsView()
          .buttonsViewAnimationStyle()
          .onTapGesture {
            withAnimation {
              isShowingButtons.toggle()
          }
        }
      }
    }
  }
}
