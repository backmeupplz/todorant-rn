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
          if let warning = model.warning {
            Text(warning)
              .widgetWarningTextModifier()
          }
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
        
        if model.family != .systemSmall {
          HStack {
            Button(action: {}, label: {
              Image(uiImage: #imageLiteral(resourceName: "skip"))
            })
            .widgetTextStyle()
            .aspectRatio(1, contentMode: .fill)
          }
        }
        
        if let warning = model.warning {
          Text(warning)
            .widgetWarningTextModifier()
        }
        
      } else {
      Text(model.text)
        .widgetTextStyle()
        .padding(.top)
      }
    }
  }
}

struct TodoEntryView_Previews: PreviewProvider {
  static let model = TodoWidgetContent(family: .systemMedium, currentProgress: 1, maximumProgress: 3, text: "Buy oat milk", warning: "Error getting data")
  static var previews: some View {

    TodoEntryView(model: model)
      .frame(height: 200)

  }
}



