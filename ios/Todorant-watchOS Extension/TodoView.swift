//
//  TodoView.swift
//  Todorant-watchOS Extension
//
//  Created by Яков Карпов on 28.10.2020.
//  Copyright © 2020 Facebook. All rights reserved.
//

import SwiftUI

struct TodoView: View {
  @EnvironmentObject var store: Store

  var body: some View {
    VStack {
      if !store.authenticated {
        TodoComplicationView(complication: .notAuthenticated)
      } else if store.loading {
        TodoComplicationView(complication: .loading)
      } else if store.errorShown {
        TodoComplicationView(complication: .error)
      } else {
        if let todo = store.currentState?.todo {
            SegmentedProgressBarView(currentProgress: 1, maximumProgress: 3)
            Text(todo.text.stringWithLinksTruncated())
              .todoTextStyle()
        }
      }
    }
  }
}

struct TodoView_Previews: PreviewProvider {
  static var previews: some View {
    TodoView()
  }
}
