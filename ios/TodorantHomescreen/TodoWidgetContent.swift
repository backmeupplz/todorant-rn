//
//  TodoWidgetContent.swift
//  Todorant
//
//  Created by Yakov Karpov on 04.10.2020.
//  Copyright © 2020 Todorant. All rights reserved.
//

import WidgetKit

struct TodoWidgetContent: TimelineEntry {
  var date = Date()

  var currentProgress: Int?
  var maximumProgress: Int?
  var warning: String?
  let text: String
  
  var title: String?
  
  // Regular view / Regular + warning view
  init(currentProgress: Int, maximumProgress: Int, text: String, warning: String?) {
    self.currentProgress = currentProgress
    self.maximumProgress = maximumProgress
    self.text = text
    self.warning = warning
  }
  
  // Clear / Empty view
  init(title: String, text: String, warning: String?) {
    self.title = title
    self.text = text
    self.warning = warning
  }
  
  // Error view
  init(text: String) {
    self.text = text
  }

}
