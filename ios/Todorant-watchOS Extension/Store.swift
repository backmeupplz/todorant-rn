//
//  Store.swift
//  Todorant
//
//  Created by Яков Карпов on 03.11.2020.
//  Copyright © 2020 Facebook. All rights reserved.
//

import Foundation
import ClockKit
import KeychainAccess

enum Key: String {
  case accessToken
  case password
}

final class UserSession {
  static var accessToken: String? {
    let keychain = Keychain(service: "todorant", accessGroup: "ACWP4F58HZ.com.todorant.app")
    return try? keychain.getString(Key.accessToken.rawValue)
  }

  static var password: String? {
    let keychain = Keychain(service: "todorant", accessGroup: "ACWP4F58HZ.com.todorant.app")
    return try? keychain.getString(Key.password.rawValue)
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
  
  static let shared = Store()
  
  private init() {
    self.updateCurrent()
  }
  
  func updateCurrent(completion: (() -> Void)? = nil) {
    loading = true
    TodoRoute<CurrentState>(route: .current, parameters: ["date": String.today])
      .execute { result in
        self.loading = false
        switch result {
          case let .success(currentState):
            // Update state
            self.currentState = currentState
            self.reloadActiveComplications()
            self.errorShown = false
          case .failure:
            self.errorShown = true
        }
        completion?()
      }
  }
  
  private func reloadActiveComplications() {
    let server = CLKComplicationServer.sharedInstance()
    
    server.activeComplications?.forEach { complication in
        server.reloadTimeline(for: complication)
        print("Timline reload at \(Date())")
    }
  }
}
