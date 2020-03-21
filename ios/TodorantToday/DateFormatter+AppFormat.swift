//
//  DateFormatter+AppFormat.swift
//  Todorant
//
//  Created by Dmitriy Karachentsov on 20/10/19.
//  Copyright © 2019 Todorant. All rights reserved.
//

import Foundation

extension DateFormatter {
  static var appDate: DateFormatter = {
    let formatter = DateFormatter()
    formatter.dateFormat = "yyyy-MM-dd"
    return formatter
  }()

  static var appMonthAndYear: DateFormatter = {
    let dateFormatter = DateFormatter()
    dateFormatter.dateFormat = "yyyy-MM"
    return dateFormatter
  }()

  static var appTime: DateFormatter = {
    let dateFormatter = DateFormatter()
    dateFormatter.dateFormat = "HH:mm"
    return dateFormatter
  }()
}
