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
  
  let family: WidgetFamily

  var currentProgress: Int?
  var maximumProgress: Int?
  var warning: String?
  let text: String
  
  var title: String?
  
  // Regular view / Regular + warning view
  init(family: WidgetFamily, currentProgress: Int, maximumProgress: Int, text: String, warning: String?) {
    self.currentProgress = currentProgress
    self.maximumProgress = maximumProgress
    self.text = text
    self.warning = warning
    self.family = family
  }
  
  // Clear / Empty view
  init(family: WidgetFamily, title: String, text: String, warning: String?) {
    self.title = title
    self.text = text
    self.warning = warning
    self.family = family
  }
  
  // Error view
  init(family: WidgetFamily, text: String) {
    self.text = text
    self.family = family
  }

}
