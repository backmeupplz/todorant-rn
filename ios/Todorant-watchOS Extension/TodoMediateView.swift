//
//  TodoAuthenticateView.swift
//  Todorant
//
//  Created by Яков Карпов on 05.11.2020.
//  Copyright © 2020 Facebook. All rights reserved.
//

import SwiftUI

struct TodoMediateView: View {
  let condition: Conditions
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
        } else {
          ProgressView()
        }
      }
      .todoTextStyle()
    }
  }
}

enum Conditions {
  case notAuthenticated, error, loading
}
