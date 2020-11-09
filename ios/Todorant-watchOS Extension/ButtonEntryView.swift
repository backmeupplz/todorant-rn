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

  var body: some View {
      Image(uiImage: buttonImage)
        .renderingMode(.template)
        .foregroundColor(Color(.white))
        .scaledToFill()
        .padding()
  }
}
