//
//  ClearView.swift
//  Todorant-watchOS Extension
//
//  Created by Яков Карпов on 06.11.2020.
//  Copyright © 2020 Facebook. All rights reserved.
//

import SwiftUI

struct ClearView: View {
  
  let currentState: CurrentState
  
  var body: some View {
    VStack {
      SegmentedProgressBarView(
        currentProgress: currentState.todosCount - currentState.incompleteTodosCount,
        maximumProgress: currentState.todosCount
      )
      VStack {
        Text("🎉")
          .font(.title)
        Text("clear.subtitle")
      }
        .todoTextStyle()
    }
  }
}
