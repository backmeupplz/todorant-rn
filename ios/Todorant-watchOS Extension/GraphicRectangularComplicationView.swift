//
//  GraphicRectangularComplicationView.swift
//  Todorant-watchOS Extension
//
//  Created by Яков Карпов on 19.01.2021.
//  Copyright © 2021 Facebook. All rights reserved.
//

import SwiftUI
import ClockKit

struct GraphicRectangularComplicationView: View {
  let complicationData: GraphicRectangularData
  
  var body: some View {
    let currentProgress = complicationData.completeTodos
    let maximumProgress = complicationData.maximumTodos
      VStack {
        //SegmentedProgressBarView(currentProgress: complicationData.completeTodos, maximumProgress: complicationData.maximumTodos)
        SegmentedProgressBarView(currentProgress: Int(currentProgress), maximumProgress: Int(maximumProgress))
        Text(complicationData.todoText)
          .todoTextStyle()
          .font(.callout)
          .lineLimit(2)
      }
      .edgesIgnoringSafeArea(.all)
    }
}

struct GraphicRectangularComplicationView_Previews: PreviewProvider {
    static var previews: some View {
      CLKComplicationTemplateGraphicRectangularFullView(
      GraphicRectangularComplicationView(complicationData: GraphicRectangularData(maximumTodos: 14, completeTodos: 3, todoText: "Buy oat milk"))
      )
      .previewContext()
    }
}
