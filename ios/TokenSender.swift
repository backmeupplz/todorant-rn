//
//  TokenSender.swift
//  Todorant
//
//  Created by Яков Карпов on 09.11.2020.
//  Copyright © 2020 Facebook. All rights reserved.
//

import Foundation
import WatchConnectivity

class TokenSender: NSObject, WCSessionDelegate {
  
  #if os(iOS)
  func sessionDidBecomeInactive(_ session: WCSession) { }
  func sessionDidDeactivate(_ session: WCSession) { }
  #endif
  
  var session: WCSession
  
  init(session: WCSession = .default){
      self.session = session
      super.init()
      self.session.delegate = self
      session.activate()
  }
  
  func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) { }
}
