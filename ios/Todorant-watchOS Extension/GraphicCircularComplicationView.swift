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
  let complicationData: GraphicCircularData

  var body: some View {
    Gauge(value: complicationData.completeTodos, in: 0 ... complicationData.maximumTodos) {
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

struct GraphicCircularComplicationView_Previews: PreviewProvider {
  static var previews: some View {
    CLKComplicationTemplateGraphicCircularView(
      GraphicCircularComplicationView(complicationData: GraphicCircularData(maximumTodos: 12, completeTodos: 3))
    )
    .previewContext()
  }
}
