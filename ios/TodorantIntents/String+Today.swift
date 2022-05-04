//
//  String+Today.swift
//  Todorant
//
//  Created by Dmitriy Karachentsov on 20/10/19.
//  Copyright © 2019 Todorant. All rights reserved.
//

import Foundation

extension String {
  static var today: String {
    let date = Date()
    return DateFormatter
      .appDate
      .string(from: date)
  }
}
