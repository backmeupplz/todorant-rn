//
//  TodoView.swift
//  Todorant-watchOS Extension
//
//  Created by Яков Карпов on 28.10.2020.
//  Copyright © 2020 Facebook. All rights reserved.
//

import SwiftUI

struct TodoView: View {
    var body: some View {
      VStack {
        SegmentedProgressBarView(currentProgress: 1, maximumProgress: 3)
        
        Text("Достаточно длинный текст таска")
          .todoTextStyle()
      }
    }
}

struct TodoView_Previews: PreviewProvider {
    static var previews: some View {
        TodoView()
    }
}
