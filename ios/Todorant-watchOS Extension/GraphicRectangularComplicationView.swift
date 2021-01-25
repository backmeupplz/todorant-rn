//
//  GraphicRectangularComplicationView.swift
//  Todorant-watchOS Extension
//
//  Created by Яков Карпов on 19.01.2021.
//  Copyright © 2021 Facebook. All rights reserved.
//

import ClockKit
import SwiftUI

struct GraphicRectangularComplicationView: View {
  let store: Store
  var snapshot = false

  var body: some View {
    VStack {
      if snapshot {
        SegmentedProgressBarView(
          currentProgress: 1,
          maximumProgress: 3
        )
        Text("Buy oat milk")
          .todoTextStyle()
          .font(.callout)
          .lineLimit(2)
      } else if !store.authenticated {
        TodoMediateView(condition: .notAuthenticated)
      } else if store.loading {
        TodoMediateView(condition: .loading)
      } else if store.errorShown {
        TodoMediateView(condition: .error)
      } else {
        if let currentState = store.currentState {
          if let todo = store.currentState?.todo {
            SegmentedProgressBarView(
              currentProgress: currentState.todosCount - currentState.incompleteTodosCount,
              maximumProgress: currentState.todosCount
            )
            Text(todo.text.stringWithLinksTruncated())
              .todoTextStyle()
              .font(.callout)
              .lineLimit(2)
          } else if currentState.todosCount > 0 && currentState.incompleteTodosCount == 0 {
            ClearView(
              complication: true,
              currentProgress: currentState.todosCount - currentState.incompleteTodosCount,
              maximumProgress: currentState.todosCount
            )
          } else {
            EmptyView(complication: true)
          }
        }
      }
    }
    .edgesIgnoringSafeArea(.all)
  }
}

// struct GraphicRectangularComplicationView_Previews: PreviewProvider {
//    static var previews: some View {
//      CLKComplicationTemplateGraphicRectangularFullView(
//      GraphicRectangularComplicationView(complicationData: GraphicRectangularData(maximumTodos: 14, completeTodos: 3, todoText: "Buy oat milk"))
//      )
//      .previewContext()
//      CLKComplicationTemplateGraphicRectangularFullView(
//        GraphicRectangularComplicationView(complicationData: GraphicRectangularData(condition: .watchLoading))
//      )
//      .previewContext()
//    }
// }
