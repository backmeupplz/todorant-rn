//
//  Store.swift
//  TodorantToday
//
//  Created by Nikita Kolmogorov on 2019-10-09.
//  Copyright © 2019 Todorant. All rights reserved.
//

import Foundation
import SwiftKeychainWrapper

enum Key: String {
  case accessToken
}

final class UserSession {
  static var accessToken: String? {
    return KeychainWrapper(serviceName: "todorant", accessGroup: "ACWP4F58HZ.com.todorant.app")
      .string(forKey: Key.accessToken.rawValue)
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

  func updateCurrent() {
    self.loading = true
    TodoRoute<CurrentState>(route: .current, parameters: ["date": String.today])
    .execute { result in
      self.loading = false
      switch result {
      case .success(let currentState):
        // Update state
        self.currentState = currentState
        self.errorShown = false
      case .failure:
        self.errorShown = true
      }
    }
  }
}
