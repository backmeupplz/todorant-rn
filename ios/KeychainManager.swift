//
//  KeychainManager.swift
//  Todorant
//
//  Created by Nikita Kolmogorov on 2020-03-20.
//  Copyright © 2020 Facebook. All rights reserved.
//

import Foundation

let keychainWrapper = KeychainWrapper(
  serviceName: "todorant",
  accessGroup: "ACWP4F58HZ.com.todorant.app"
)

@objc(KeychainManager)
class KeychainManager: NSObject {
  @objc(setToken:)
  func setToken(token: String) -> Void {
    keychainWrapper.set(token, forKey: "accessToken")
  }
  
  @objc
  func removeToken() -> Void {
    keychainWrapper.removeObject(forKey: "accessToken")
  }
  
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return true
  }
}
