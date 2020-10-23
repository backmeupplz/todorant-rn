//
//  TodoEntryView.swift
//  TodorantWidget
//
//  Created by Yakov Karpov on 04.10.2020.
//  Copyright © 2020 Todorant. All rights reserved.
//

import SwiftUI

struct TodoEntryView: View {
  let model: TodoWidgetContent

  var body: some View {
    VStack {
      if let title = model.title {
        VStack {
          Text(title)
            .font(.title)
          Text(model.text)
        }
        .modifier(WidgetTodoTextModifier())
      } else if let currentProgress = model.currentProgress,
        let maximumProgress = model.maximumProgress
      {
        SegmentedProgressBarView(
          currentProgress: currentProgress,
          maximumProgress: maximumProgress
        )
        .padding([.leading, .top, .trailing])
        Text(model.text)
          .modifier(WidgetTodoTextModifier())
      }
    }
  }
}

struct WidgetTodoTextModifier: ViewModifier {
//  let mainColor: Color = .buttonsRowBackground
  let mainColor: Color = Color(.systemRed)

  func body(content: Content) -> some View {
    content
      .padding()
      .frame(maxWidth: .infinity, maxHeight: .infinity)
      .background(mainColor)
//      .cornerRadius(10)
      .padding()
  }
}
