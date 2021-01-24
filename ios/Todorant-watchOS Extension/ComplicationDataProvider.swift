//
//  ComplicationDataOperator.swift
//  Todorant-watchOS Extension
//
//  Created by Яков Карпов on 21.01.2021.
//  Copyright © 2021 Facebook. All rights reserved.
//

import Foundation

private protocol ComplicationData {
  var maximumTodos: Float? { get }
  var completeTodos: Float? { get }
}

struct GraphicCircularData: ComplicationData {
  var maximumTodos: Float?
  var completeTodos: Float?
  
  public init(maximumTodos: Float, completeTodos: Float) {
    self.maximumTodos = maximumTodos
    self.completeTodos = completeTodos
  }
}

struct GraphicRectangularData: ComplicationData { // TODO: Add Mediate Views
  var maximumTodos: Float?
  var completeTodos: Float?
  var todoText: String?
  var condition: MediateConditions?
  
  public init(maximumTodos: Float, completeTodos: Float, todoText: String) {
    self.maximumTodos = maximumTodos
    self.completeTodos = completeTodos
    self.todoText = todoText
  }
  
  public init(condition: MediateConditions) {
    self.condition = condition
  }
}

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
      }
    }
    return GraphicRectangularData(condition: .error)
  }
}
