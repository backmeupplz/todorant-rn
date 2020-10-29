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
        .transition(.scale)
        .onTapGesture {
          withAnimation {
            isShowingButtons.toggle()
          }
        }
      if isShowingButtons {
        ButtonsView()
          .transition(.move(edge: .top))
          .onTapGesture {
            withAnimation {
              isShowingButtons.toggle()
          }
        }
      }
    }
  }
}

struct SwipableNavigationView_Previews: PreviewProvider {
  static var previews: some View {
    SwipableNavigationView()
  }
}
