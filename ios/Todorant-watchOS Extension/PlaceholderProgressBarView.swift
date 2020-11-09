//
//  PlaceholderProgressBarView.swift
//  Todorant-watchOS Extension
//
//  Created by Яков Карпов on 09.11.2020.
//  Copyright © 2020 Facebook. All rights reserved.
//

import SwiftUI

struct PlaceholderProgressBarView: View {
    var body: some View {
      HStack {
        Text("∞")
          .font(.headline)
          .foregroundColor(.progressBar)
        Capsule()
          .frame(maxHeight: 2)
          .foregroundColor(Color.secondary.opacity(0.3))
        Text("∞")
          .font(.headline)
          .foregroundColor(.progressBar)
      }
    }
}


