//
//  ClearView.swift
//  Todorant-watchOS Extension
//
//  Created by Яков Карпов on 06.11.2020.
//  Copyright © 2020 Facebook. All rights reserved.
//

import SwiftUI

struct ClearView: View {
    var body: some View {
      VStack{
        Text("🎉")
          .font(.title)
        Text("clear.subtitle")
      }
      .todoTextStyle()
    }
}
