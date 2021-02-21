//
//  watchUpdateManager.swift
//  Todorant-watchOS Extension
//
//  Created by Яков Карпов on 21.02.2021.
//  Copyright © 2021 Facebook. All rights reserved.
//

import Foundation

@objc(WatchUpdateManager)
class WatchUpdateManager: NSObject {
  
  let tokenSender = TokenSender()
  
  @objc
  func updateContext() {
    self.tokenSender.session.sendMessage(["storeUpdatedAt": Date()], replyHandler: nil) { (error) in
      print(error.localizedDescription)
    }
  }
  
}
