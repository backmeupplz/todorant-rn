//
//  TodoView.swift
//  Todorant-watchOS Extension
//
//  Created by Яков Карпов on 16.11.2020.
//  Copyright © 2020 Facebook. All rights reserved.
//

import SwiftUI

struct TodoView: View {
  
  let currentState: CurrentState
  let todo: Todo
  @Binding var isShowingButtonsView: Bool
  
    var body: some View {
      VStack {
        SegmentedProgressBarView(
          currentProgress: currentState.todosCount - currentState.incompleteTodosCount,
          maximumProgress: currentState.todosCount
        )
        Text(todo.text.stringWithLinksTruncated())
          .todoTextStyle()
      }
      .gesture(SwipeRecognizer.defaultDragGesture
        .onEnded { value in
          if SwipeRecognizer.isDownSwipe(value: value) {
            withAnimation {
              isShowingButtonsView.toggle()
            }
          }
        })
    }
}

