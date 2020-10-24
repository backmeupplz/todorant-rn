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
  let text: String
  
  var title: String?
  
  
  init(currentProgress: Int, maximumProgress: Int, text: String) {
    self.currentProgress = currentProgress
    self.maximumProgress = maximumProgress
    self.text = text
  }
  
  init(title: String, text: String) {
    self.title = title
    self.text = text
  }
  
  init(text: String) {
    self.text = text
  }

}
