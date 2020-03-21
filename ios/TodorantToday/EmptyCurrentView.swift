//
//  EmptyCurrentView.swift
//  TodorantToday
//
//  Created by Nikita Kolmogorov on 2019-10-09.
//  Copyright © 2019 Todorant. All rights reserved.
//

import SwiftUI

struct EmptyCurrentView: View {
  let extensionContext: NSExtensionContext

  var body: some View {
    VStack {
      Text("🐝")
        .font(.title)
      Text("empty.subtitle")
      Button("empty.button") {
        self.extensionContext.open(URL(string: "todorant://")!)
      }
    }
  }
}
