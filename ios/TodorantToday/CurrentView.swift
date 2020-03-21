//
//  CurrentView.swift
//  TodorantToday
//
//  Created by Nikita Kolmogorov on 2019-10-09.
//  Copyright © 2019 Todorant. All rights reserved.
//

import SwiftUI

struct CurrentView: View {
  @EnvironmentObject var store: Store

  let extensionContext: NSExtensionContext

  var body: some View {
    VStack {
      if !store.authenticated {
        Text("authenticate")
        Button("authenticate.button") {
          self.extensionContext.open(URL(string: "todorant://")!)
        }
      } else if store.loading {
        Text("loading")
        ActivityIndicator()
      } else if store.errorShown {
        Text("error")
        Button("retry") {
          self.store.updateCurrent()
        }
      } else {
        self.store.currentState.map { currentState in
          ViewBuilder.buildEither(first:
            VStack {
              if currentState.todosCount <= 0 {
                EmptyCurrentView(extensionContext: extensionContext)
              } else if currentState.todosCount > 0 && currentState.incompleteTodosCount == 0 {
                ClearView()
              } else {
                CurrentTodoView()
              }
            }
          )
        } ?? ViewBuilder.buildEither(second:
          VStack {
            Text("error")
            Button("retry") {
              self.store.updateCurrent()
            }
          }
        )
      }
      Spacer()
    }
  }
}

struct CurrentTodoView: View {
  @EnvironmentObject var store: Store

  var body: some View {
    store.currentState.map { currentState in
      VStack {
        HStack {
          ProgressView(progress:
            Float(currentState.todosCount - currentState.incompleteTodosCount) / Float(currentState.todosCount))
          Text("\(currentState.todosCount - currentState.incompleteTodosCount)/\(currentState.todosCount)")
        }
        CurrentTodoViewCard()
      }
    }
  }
}

struct CurrentTodoViewCard: View {
  @EnvironmentObject var store: Store

  var body: some View {
    store.currentState.map { currentState in
      currentState.todo.map { todo in
        VStack {
          Text("\(todo.frog ? "🐸 " : "")\(todo.text)")
            .lineLimit(self.store.expanded ? nil : 1)
            .fixedSize(horizontal: false, vertical: true)
          HStack {
            Spacer()
            Button(action: {
              self.store.loading = true
              TodoRoute<EmptyResponse>(route: .delete(id: todo._id))
                .execute { result in
                  self.store.loading = false
                  switch result {
                  case .success:
                    self.store.updateCurrent()
                  case .failure:
                    self.store.errorShown = true
                  }
                }
            }) {
              Image(systemName: "trash")
                .modifier(CurrentButtonIcon())
            }
            if !todo.skipped && !todo.frog {
              Button(action: {
                self.store.loading = true
                TodoRoute<EmptyResponse>(route: .skip(id: todo._id))
                  .execute { result in
                    self.store.loading = false
                    switch result {
                    case .success:
                      self.store.updateCurrent()
                    case .failure:
                      self.store.errorShown = true
                    }
                  }
              }) {
                Image(systemName: "arrow.right")
                  .modifier(CurrentButtonIcon())
              }
            }
            Button(action: {
              self.store.loading = true
              TodoRoute<EmptyResponse>(route: .done(id: todo._id))
                .execute { result in
                  self.store.loading = false
                  switch result {
                  case .success:
                    self.store.updateCurrent()
                  case .failure:
                    self.store.errorShown = true
                  }
                }
            }) {
              Image(systemName: "checkmark")
                .modifier(CurrentButtonIcon())
            }
            Button(action: {
              self.store.updateCurrent()
            }) {
              Image(systemName: "arrow.2.circlepath")
                .modifier(CurrentButtonIcon())
            }
          }
        }
      }
    }
  }
}

struct CurrentButtonIcon: ViewModifier {
  func body(content: Content) -> some View {
    content
      .padding()
      .font(.headline)
      .foregroundColor(.blue)
  }
}
