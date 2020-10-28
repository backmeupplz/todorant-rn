//
//  ButtonsView.swift
//  Todorant-watchOS Extension
//
//  Created by Яков Карпов on 29.10.2020.
//  Copyright © 2020 Facebook. All rights reserved.
//

import SwiftUI

struct ButtonsView: View {
    var body: some View {
      VStack {
        HStack {
          Button(action: {
            
          }) {
            ButtonEntryView(buttonImage: #imageLiteral(resourceName: "refresh"), buttonText: "Reload")
          }
          Button(action: {
            
          }) {
            ButtonEntryView(buttonImage: #imageLiteral(resourceName: "delete"), buttonText: "Delete")
          }
        }
        HStack {
          Button(action: {
            
          }) {
            ButtonEntryView(buttonImage: #imageLiteral(resourceName: "skip"), buttonText: "Skip")
          }
          Button(action: {
            
          }) {
            ButtonEntryView(buttonImage: #imageLiteral(resourceName: "done"), buttonText: "Done")
          }
        }
      }
    }
}

struct ButtonView_Previews: PreviewProvider {
    static var previews: some View {
        ButtonsView()
    }
}
