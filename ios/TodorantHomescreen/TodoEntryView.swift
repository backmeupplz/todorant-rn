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
            .widgetTitleStyle()
          Text(model.text)
            .widgetTextStyle()
        }
      } else if let currentProgress = model.currentProgress,
        let maximumProgress = model.maximumProgress
      {
        SegmentedProgressBarView(
          currentProgress: currentProgress,
          maximumProgress: maximumProgress
        )
        .widgetTopElementPadding()
        Text(model.text)
          .widgetTextStyle()
      } else {
      Text(model.text)
        .widgetTextStyle()
      }
    }
  }
}



