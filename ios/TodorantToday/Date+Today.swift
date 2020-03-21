//
//  Date+Today.swift
//  TodorantToday
//
//  Created by Nikita Kolmogorov on 2019-10-09.
//  Copyright © 2019 Todorant. All rights reserved.
//

import Foundation

extension Date {
  var dayBefore: Date {
      return Calendar.current.date(byAdding: .day, value: -1, to: noon)!
  }
  var dayAfter: Date {
      return Calendar.current.date(byAdding: .day, value: 1, to: noon)!
  }
  var noon: Date {
      return Calendar.current.date(bySettingHour: 12, minute: 0, second: 0, of: self)!
  }

  static func today() -> String {
    let date = Date()
    let formatter = DateFormatter()
    formatter.dateFormat = "yyyy-MM-dd"
    return formatter.string(from: date)
  }

  static func yesterday() -> String {
    let date = Date().dayBefore
    let formatter = DateFormatter()
    formatter.dateFormat = "yyyy-MM-dd"
    return formatter.string(from: date)
  }

  static func tomorrow() -> String {
    let date = Date().dayAfter
    let formatter = DateFormatter()
    formatter.dateFormat = "yyyy-MM-dd"
    return formatter.string(from: date)
  }
}
