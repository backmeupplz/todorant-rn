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
      SegmentedProgressBarView(
        currentProgress: model.currentProgress,
        maximumProgress: model.maximumProgress
      )
      .padding([.leading, .top, .trailing])

      Text(model.todoText)
        .modifier(WidgetTodoTextModifier())
    }
  }
}

struct WidgetTodoTextModifier: ViewModifier {
  let mainColor: Color = .buttonsRowBackground

  func body(content: Content) -> some View {
    content
      .font(.footnote)
      .padding()
      .frame(maxWidth: .infinity, maxHeight: .infinity)
      .background(mainColor)
      .clipShape(ContainerRelativeShape())
      .padding(8)
  }
}
