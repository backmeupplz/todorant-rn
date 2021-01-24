//
//  TodoAuthenticateView.swift
//  Todorant
//
//  Created by Яков Карпов on 05.11.2020.
//  Copyright © 2020 Facebook. All rights reserved.
//

import SwiftUI

struct TodoMediateView: View {
  let condition: MediateConditions
  var body: some View {
    VStack {
      PlaceholderProgressBarView()

      Group {
        if condition == .notAuthenticated {
          Text("authenticate")
            .padding(.horizontal)
        } else if condition == .error {
          Text("error")
            .padding(.horizontal)
        } else if condition == .watchLoading {
          Text("Loading")
            .padding(.horizontal)
        } else {
          ProgressView()
        }
      }
      .todoTextStyle()
    }
  }
}

enum MediateConditions {
  case notAuthenticated, error, loading, watchLoading
}
