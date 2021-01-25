//
//  GraphicCircularComplicationView.swift
//  Todorant-watchOS Extension
//
//  Created by Яков Карпов on 25.12.2020.
//  Copyright © 2020 Facebook. All rights reserved.
//

import ClockKit
import SwiftUI

struct GraphicCircularComplicationView: View {
  let store: Store
  var snapshot = false
  
  var body: some View {
    let complicationData = getComplicationData(store: store, snapshot: snapshot)
    return Gauge(value: complicationData.completeTodos, in: 0 ... complicationData.maximumTodos) {
      Text("Todos")
    } currentValueLabel: {
      Text("\(Int(complicationData.completeTodos))")
        .foregroundColor(Color.progressBar)
        .complicationForeground()
    } minimumValueLabel: {
      Text("\(Int(0))")
    } maximumValueLabel: {
      Text("\(Int(complicationData.maximumTodos))")
    }
    .gaugeStyle(CircularGaugeStyle(tint: Color.progressBar))
  
  }
}

struct GraphicCircularComplicationData {
  var maximumTodos: Float
  var completeTodos: Float
}

private func getComplicationData(store: Store, snapshot: Bool = false) -> GraphicCircularComplicationData {
  if snapshot {
    return GraphicCircularComplicationData(maximumTodos: 3, completeTodos: 1)
  }
  if let currentState = store.currentState {
    return GraphicCircularComplicationData(maximumTodos: Float(currentState.todosCount), completeTodos: Float(currentState.todosCount - currentState.incompleteTodosCount))
  } else {
    return GraphicCircularComplicationData(maximumTodos: 0, completeTodos: 0)
  }
}

//struct GraphicCircularComplicationView_Previews: PreviewProvider {
//  static var previews: some View {
//    CLKComplicationTemplateGraphicCircularView(
//      GraphicCircularComplicationView(complicationData: GraphicCircularData(maximumTodos: 12, completeTodos: 3))
//    )
//    .previewContext()
//  }
//}
