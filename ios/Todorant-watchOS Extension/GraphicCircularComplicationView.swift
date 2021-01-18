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
  let maximumTodos: Float
  let completeTodos: Float

  var body: some View {
      Gauge(value: completeTodos, in: 0 ... maximumTodos) {
        Text("Todos")
      } currentValueLabel: {
        Text("\(Int(completeTodos))")
          .foregroundColor(Color.progressBar)
          .complicationForeground()
      } minimumValueLabel: {
        Text("\(Int(0))")
      } maximumValueLabel: {
        Text("\(Int(maximumTodos))")
      }
      .gaugeStyle(CircularGaugeStyle(tint: Color.progressBar))
  }
}

struct GraphicCircularComplicationView_Previews: PreviewProvider {
  static var previews: some View {
    CLKComplicationTemplateGraphicCircularView(
      GraphicCircularComplicationView(maximumTodos: 7, completeTodos: 4)
    )
    .previewContext()
  }
}
