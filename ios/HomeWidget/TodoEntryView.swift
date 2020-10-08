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
      if let currentProgress = model.currentProgress,
        let maximumProgress = model.maximumProgress
      {
        SegmentedProgressBarView(
          currentProgress: currentProgress,
          maximumProgress: maximumProgress
        )
        .padding([.leading, .top, .trailing])
        Text(model.text)
          .font(.footnote)
          .modifier(WidgetTodoTextModifier())
      } else if let title = model.title {
        Group {
          Text(title)
          Text(model.text)
            .font(.footnote)
            .multilineTextAlignment(.center)
        }.modifier(WidgetTodoTextModifier())
      } else {
        Text(model.text)
          .font(.footnote)
          .multilineTextAlignment(.center)
          .modifier(WidgetTodoTextModifier())
      }
    }
  }
}

struct WidgetTodoTextModifier: ViewModifier {
  let mainColor: Color = .buttonsRowBackground

  func body(content: Content) -> some View {
    content
      .padding()
      .frame(maxWidth: .infinity, maxHeight: .infinity)
      .background(mainColor)
      .clipShape(ContainerRelativeShape())
      .padding(8)
  }
}
