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
      store.currentState.map { currentState in
        currentState.todo.map { todo in
          VStack {
            SegmentedProgressBarView(currentProgress: 1, maximumProgress: 3)
//            Text(todo.text.stringWithLinksTruncated())
//              .todoTextStyle()
            Text("Test")
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
