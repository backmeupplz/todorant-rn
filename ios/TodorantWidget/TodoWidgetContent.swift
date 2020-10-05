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

  let currentProgress: Int
  let maximumProgress: Int

  let todoText: String
}
