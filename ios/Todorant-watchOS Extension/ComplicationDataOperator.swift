//
//  ComplicationDataOperator.swift
//  Todorant-watchOS Extension
//
//  Created by Яков Карпов on 21.01.2021.
//  Copyright © 2021 Facebook. All rights reserved.
//

import Foundation

private protocol ComplicationData {
  var maximumTodos: Float { get }
  var completeTodos: Float { get }
}

struct GraphicCircularData: ComplicationData {
  var maximumTodos: Float
  var completeTodos: Float
}

struct GraphicRectangularData: ComplicationData { // TODO: Add Mediate Views
  var maximumTodos: Float
  var completeTodos: Float
  var todoText: String
}

struct ComplicationDataOperator {
  
  func getGraphicCircularData(store: Store) -> GraphicCircularData? {
    if store.authenticated, !store.loading, !store.errorShown {
      if let currentState = store.currentState {
        return GraphicCircularData(
          maximumTodos: Float(currentState.todosCount),
          completeTodos: Float(currentState.todosCount - currentState.incompleteTodosCount)
        )
      }
    }
    return nil
  }

  func getGraphicRectangularData(store: Store) -> GraphicRectangularData? {
    if store.authenticated, !store.loading, !store.errorShown {
      if let currentState = store.currentState {
        if let todo = store.currentState?.todo {
          return GraphicRectangularData(
            maximumTodos: Float(currentState.todosCount),
            completeTodos: Float(currentState.todosCount - currentState.incompleteTodosCount),
            todoText: todo.text
          )
        }
      }
    }
    return nil
  }
}
