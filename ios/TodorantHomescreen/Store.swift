//
//  Store.swift
//  TodorantHomescreen
//
//  Created by Яков Карпов on 13.02.2021.
//  Copyright © 2021 Facebook. All rights reserved.
//

import Foundation
import SwiftKeychainWrapper
import WidgetKit

enum Key: String {
  case accessToken
  case password
}

final class UserSession {
  
  static var accessToken: String? {
    return KeychainWrapper(serviceName: "todorant", accessGroup: "ACWP4F58HZ.com.todorant.app")
          .string(forKey: Key.accessToken.rawValue)
  }
  
  static var password: String? {
    return KeychainWrapper(serviceName: "todorant", accessGroup: "ACWP4F58HZ.com.todorant.app")
          .string(forKey: Key.password.rawValue)
  }
}

struct Todo: Codable {
  let _id: String

  let text: String
  let completed: Bool
  let frog: Bool
  let skipped: Bool

  let monthAndYear: String
  let date: String?
  let time: String?

  let createdAt: String
  let updatedAt: String

  func shortCreatedAt() -> String {
    return String(createdAt.prefix(10))
  }
}

extension Todo: Hashable {
  func hash(into hasher: inout Hasher) {
    hasher.combine(_id)
  }
}

struct CurrentState: Codable {
  let todosCount: Int
  let incompleteTodosCount: Int
  let todo: Todo?
}

class Store: ObservableObject {
  
  @Published var authenticated = UserSession.accessToken != nil

  @Published var currentState: CurrentState?

  @Published var loading = false
  @Published var errorShown = false

  @Published var expanded = false
  @Published var updatedAt: String
  
  static let shared = Store()
  
  private init() {
    updatedAt = getCurrentTime()
    self.updateCurrent()
  }

  func updateCurrent(completion: (() -> Void)? = nil) {
    self.loading = true
    TodoRoute<CurrentState>(route: .current, parameters: ["date": String.today])
    .execute { result in
      self.loading = false
      switch result {
      case .success(let currentState):
        // Update state
        self.currentState = currentState
        self.updatedAt = getCurrentTime()
        self.errorShown = false
      case .failure:
        self.errorShown = true
      }
      completion?()
    }
  }
}

private func getCurrentTime() -> String {
  let now = Date()
  let formatter = DateFormatter()
  formatter.setLocalizedDateFormatFromTemplate("MM dd HH:mm")
  return NSLocalizedString("timesStamp", comment: "") + " " + formatter.string(from: now)
}
