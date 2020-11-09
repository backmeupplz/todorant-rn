//
//  TodoView.swift
//  Todorant-watchOS Extension
//
//  Created by Яков Карпов on 28.10.2020.
//  Copyright © 2020 Facebook. All rights reserved.
//

import SwiftUI

struct TodoView: View {
  @EnvironmentObject var store: Store
  @Binding var isShowingButtonsView: Bool

  var body: some View {
    VStack {
      if !store.authenticated {
        TodoMediateView(condition: .notAuthenticated)
      } else if store.loading {
        TodoMediateView(condition: .loading)
      } else if store.errorShown {
        TodoMediateView(condition: .error)
      } else {
        
        if let currentState = store.currentState {
          if let todo = store.currentState?.todo {
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
          } else if currentState.todosCount > 0 && currentState.incompleteTodosCount == 0 {
            SegmentedProgressBarView(
              currentProgress: currentState.todosCount - currentState.incompleteTodosCount,
              maximumProgress: currentState.todosCount
            )
            ClearView()
          } else {
            EmptyView()
          }
        }
      }
    }
  }
}
