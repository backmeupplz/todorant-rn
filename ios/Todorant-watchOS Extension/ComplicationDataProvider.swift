//
//  ComplicationDataOperator.swift
//  Todorant-watchOS Extension
//
//  Created by Яков Карпов on 21.01.2021.
//  Copyright © 2021 Facebook. All rights reserved.
//

import Foundation

struct ComplicationDataProvider {
  
  func getGraphicCircularData(store: Store) -> GraphicCircularData {
    guard let currentState = store.currentState else {
      return GraphicCircularData(maximumTodos: 0, completeTodos: 0)
    }
    return GraphicCircularData(
      maximumTodos: Float(currentState.todosCount),
      completeTodos: Float(currentState.todosCount - currentState.incompleteTodosCount)
    )
  }

  func getGraphicRectangularData(store: Store) -> GraphicRectangularData {
    if !store.authenticated {
      return GraphicRectangularData(condition: .notAuthenticated)
    }
    if store.loading {
      return GraphicRectangularData(condition: .watchLoading)
    }
    if let currentState = store.currentState {
      if let todo = store.currentState?.todo {
        return GraphicRectangularData(
          maximumTodos: Float(currentState.todosCount),
          completeTodos: Float(currentState.todosCount - currentState.incompleteTodosCount),
          todoText: todo.text
        )
      } else if currentState.todosCount > 0 && currentState.incompleteTodosCount == 0 {
        return GraphicRectangularData(condition: .clear,
                                      maximumTodos: Float(currentState.todosCount),
                                      completeTodos: Float(currentState.todosCount - currentState.incompleteTodosCount))
      } else {
        return GraphicRectangularData(condition: .empty)
      }
    }
    return GraphicRectangularData(condition: .error)
  }
}

private protocol ComplicationData {
  var maximumTodos: Float { get }
  var completeTodos: Float { get }
}

struct GraphicCircularData: ComplicationData {
  var maximumTodos: Float
  var completeTodos: Float
}

struct GraphicRectangularData: ComplicationData {
  var maximumTodos: Float
  var completeTodos: Float
  var todoText: String?
  var condition: MediateConditions?
  
  public init(maximumTodos: Float, completeTodos: Float, todoText: String) {
    self.maximumTodos = maximumTodos
    self.completeTodos = completeTodos
    self.todoText = todoText
  }
  
  public init(condition: MediateConditions, maximumTodos: Float = 0, completeTodos: Float = 0) {
    self.condition = condition
    self.maximumTodos = maximumTodos
    self.completeTodos = completeTodos
  }
}
