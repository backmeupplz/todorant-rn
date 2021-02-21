//
//  ClearView.swift
//  Todorant-watchOS Extension
//
//  Created by Яков Карпов on 06.11.2020.
//  Copyright © 2020 Facebook. All rights reserved.
//

import SwiftUI

struct ClearView: View {
  
  var complication = false
  
  let currentProgress: Int
  let maximumProgress: Int
  
  var body: some View {
    VStack {
      SegmentedProgressBarView(
        currentProgress: currentProgress,
        maximumProgress: maximumProgress
      )
      VStack {
        if complication {
          Text(NSLocalizedString("clear.subtitle", comment: "") + " 🎉")
            .font(.callout)
        } else {
          Text("🎉")
            .font(.title)
          Text("clear.subtitle")
        }
      }
        .todoTextStyle()
    }
  }
}
