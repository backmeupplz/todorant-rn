//
//  reloadActiveComplications.swift
//  Todorant-watchOS Extension
//
//  Created by Яков Карпов on 23.01.2021.
//  Copyright © 2021 Facebook. All rights reserved.
//

import Foundation
import ClockKit

func reloadActiveComplications() {
  let server = CLKComplicationServer.sharedInstance()
  
  server.activeComplications?.forEach { complication in
      server.reloadTimeline(for: complication)
      print("Timline reload at \(Date())")
  }
}
