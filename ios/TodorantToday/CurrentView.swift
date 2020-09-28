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
                CurrentTodoView(extensionContext: extensionContext)
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
    }
  }
}

struct CurrentTodoView: View {
  @EnvironmentObject var store: Store

  let extensionContext: NSExtensionContext

  var body: some View {
    store.currentState.map { currentState in
      currentState.todo.map { todo in
        VStack {
          SegmentedProgressBarView(currentProgress: currentState.todosCount - currentState.incompleteTodosCount, maximumProgress: currentState.todosCount)

          TodoTextView(todo: todo)

          buttonsRowView(todo: todo, extensionContext: extensionContext)
        }
      }
    }
  }
}

struct TodoTextView: View {
  let todo: Todo
  @EnvironmentObject var store: Store

  var body: some View {
    Text(
      "\(todo.frog ? "🐸 " : "")\(todo.time != nil ? "\(todo.time ?? "")" : "")\(todo.text)"
    )
    .lineLimit(self.store.expanded ? nil : 1)
    .fixedSize(horizontal: false, vertical: true)
  }
}

struct buttonsRowView: View {
  @EnvironmentObject var store: Store
  let todo: Todo
  let extensionContext: NSExtensionContext

  var body: some View {
    HStack {
      HStack {
        //      Refresh button
        Button(action: {
          self.store.updateCurrent()
        }) {
          Image(uiImage: #imageLiteral(resourceName: "refresh"))
            .modifier(CurrentButtonIconModifier())
        }
        //      Delete button
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
          Image(uiImage: #imageLiteral(resourceName: "delete"))
            .modifier(CurrentButtonIconModifier())
        }
        //      Skip button
        if !todo.skipped && !todo.frog && todo.time == nil {
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
            Image(uiImage: #imageLiteral(resourceName: "skip"))
              .modifier(CurrentButtonIconModifier())
          }
        }
        //      Done button
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
          Image(uiImage: #imageLiteral(resourceName: "done"))
            .modifier(CurrentButtonIconModifier())
        }
      }
      .modifier(ButtonsRowModifier())
//        Add todo button
      Button(action: {
        self.extensionContext.open(URL(string: "todorant://")!)
      }) {
        AddTodoButtonIcon()
      }
    }
  }
}

struct AddTodoButtonIcon: View {
  let plusIcon: Color = .addIconPlus

  let firstGradient: Color = .addIconGradientFirst
  let secondGradient: Color = .addIconGradientSecond

  var body: some View {
    Image(uiImage: #imageLiteral(resourceName: "add_plus"))
      .foregroundColor(plusIcon)
      .frame(width: 48, height: 40, alignment: .center)
      .background(LinearGradient(gradient: Gradient(colors: [firstGradient, secondGradient]), startPoint: .leading, endPoint: .trailing))
      .cornerRadius(20)
  }
}

// MARK: - - Modifier(s)

struct CurrentButtonIconModifier: ViewModifier {
  func body(content: Content) -> some View {
    content
      .padding([.leading, .trailing])
  }
}

struct ButtonsRowModifier: ViewModifier {
  let mainColor: Color = .buttonsRowBackground

  func body(content: Content) -> some View {
    content
      .frame(height: 40, alignment: .center)
      .background(mainColor.opacity(0.3))
      .cornerRadius(12)
  }
}
