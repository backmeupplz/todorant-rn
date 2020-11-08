//
//  TodoAuthenticateView.swift
//  Todorant
//
//  Created by Яков Карпов on 05.11.2020.
//  Copyright © 2020 Facebook. All rights reserved.
//

import SwiftUI

struct TodoComplicationView: View {
  let complication: Complications
  var body: some View {
    SegmentedProgressBarView(currentProgress: 1, maximumProgress: 1)

    Group {
      if complication == .notAuthenticated {
        Text(UserSession.accessToken ?? "no token")
          .padding(.horizontal)
      } else if complication == .error {
        Text("error")
          .padding(.horizontal)
      } else {
        ProgressView()
      }
    }
    .todoTextStyle()
  }
}

enum Complications {
  case notAuthenticated, error, loading
}
