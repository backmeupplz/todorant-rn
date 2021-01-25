//
//  TodoView.swift
//  Todorant-watchOS Extension
//
//  Created by Яков Карпов on 28.10.2020.
//  Copyright © 2020 Facebook. All rights reserved.
//

import SwiftUI

struct CurrentView: View {
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
            TodoView(
              currentState: currentState,
              todo: todo,
              isShowingButtonsView: $isShowingButtonsView
            )
          } else if currentState.todosCount > 0 && currentState.incompleteTodosCount == 0 {
            TodoMediateView(
              condition: .clear,
              currentProgress: currentState.todosCount - currentState.incompleteTodosCount,
              maximumProgress: currentState.todosCount
            )
          } else {
            TodoMediateView(condition: .empty)
          }
        }
      }
    }
  }
}
