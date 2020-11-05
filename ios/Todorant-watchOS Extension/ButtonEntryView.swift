//
//  ButtonEntryView.swift
//  Todorant-watchOS Extension
//
//  Created by Яков Карпов on 29.10.2020.
//  Copyright © 2020 Facebook. All rights reserved.
//

import SwiftUI

struct ButtonEntryView: View {
  let buttonImage: UIImage
  let buttonText: String

  var body: some View {
    VStack {
      Image(uiImage: buttonImage)
      Text(buttonText)
    }
    .padding()
  }
}
