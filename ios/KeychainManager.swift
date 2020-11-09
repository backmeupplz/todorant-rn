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
  
  let tokenSender = TokenSender()
  
  @objc(setToken:)
  func setToken(token: String) -> Void {
    keychainWrapper.set(token, forKey: "accessToken")
    
    self.tokenSender.session.sendMessage(["accessToken": token], replyHandler: nil) { (error) in
      print(error.localizedDescription)
    }
    
  }
  
  @objc
  func removeToken() -> Void {
    keychainWrapper.removeObject(forKey: "accessToken")
  }
  
  @objc(setPassword:)
  func setPassword(password: String) -> Void {
    keychainWrapper.set(password, forKey: "password")
    
    self.tokenSender.session.sendMessage(["password": password], replyHandler: nil) { (error) in
      print(error.localizedDescription)
    }
    
  }
  
  @objc
  func removePassword() -> Void {
    keychainWrapper.removeObject(forKey: "password")
  }
  
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return true
  }
}
