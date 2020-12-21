//
//  TokenReceiver.swift
//  Todorant-watchOS Extension
//
//  Created by Яков Карпов on 09.11.2020.
//  Copyright © 2020 Facebook. All rights reserved.
//

import Foundation
import WatchConnectivity
import KeychainAccess

class TokenReceiver: NSObject, WCSessionDelegate {
  
  var session: WCSession
  
  init(session: WCSession = .default){
    self.session = session
    super.init()
    self.session.delegate = self
    session.activate()
  }
  
  func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
  }
  
  func session(_ session: WCSession, didReceiveMessage message: [String : Any]) {
      DispatchQueue.main.async {
        let keychain = Keychain(service: "todorant", accessGroup: "ACWP4F58HZ.com.todorant.app")
        if let accessToken = message["accessToken"] as? String {
          if (accessToken == "delete") {
            keychain["accessToken"] = nil
          } else {
            keychain["accessToken"] = accessToken
          }
        }
        if let password = message["password"] as? String {
          if (password == "delete") {
            keychain["password"] = nil
          } else {
            keychain["password"] = password
          }
        }
      }
  }
}
