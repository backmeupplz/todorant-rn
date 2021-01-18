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
  let maximumTodos: Float
  let completeTodos: Float
  let todoText: String
  
    var body: some View {
      VStack {
        SegmentedProgressBarView(currentProgress: 3, maximumProgress: 5)
        Text(todoText)
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
      GraphicRectangularComplicationView(maximumTodos: 10, completeTodos: 4, todoText: "Buy oat milk, tofu and tempeh")
      )
      .previewContext()
    }
}
