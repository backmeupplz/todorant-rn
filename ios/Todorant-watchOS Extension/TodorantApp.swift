//
//  TodorantApp.swift
//  Todorant-watchOS Extension
//
//  Created by Яков Карпов on 28.10.2020.
//  Copyright © 2020 Facebook. All rights reserved.
//

import SwiftUI

@main
struct TodorantApp: App {
  let store = Store.shared
  
  var session = TokenReceiver()
  
  @SceneBuilder var body: some Scene {
    WindowGroup {
      NavigationView {
        SwipableNavigationView()
          .environmentObject(store)
      }
    }

    WKNotificationScene(controller: NotificationController.self, category: "myCategory")
  }
}
