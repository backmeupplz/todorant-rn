//
//  ButtonsView.swift
//  Todorant-watchOS Extension
//
//  Created by Яков Карпов on 29.10.2020.
//  Copyright © 2020 Facebook. All rights reserved.
//

import SwiftUI

struct ButtonsView: View {
  let todo: Todo
  
  @EnvironmentObject var store: Store
  
    var body: some View {
      VStack {
        HStack {
          Button(action: {
            self.store.updateCurrent()
          }) {
            ButtonEntryView(buttonImage: #imageLiteral(resourceName: "refresh"), buttonText: "Reload")
          }
          
          Button(action: {
            self.store.loading = true
            TodoRoute<EmptyResponse>(route: .delete(id: todo._id))
              .execute { result in
                self.store.loading = false
                switch result {
                case .success:
                  self.store.updateCurrent()
                case .failure:
                  self.store.errorShown = true
                }
              }
          }) {
            ButtonEntryView(buttonImage: #imageLiteral(resourceName: "delete"), buttonText: "Delete")
          }
        }
        
        HStack {
          Button(action: {
            self.store.loading = true
            TodoRoute<EmptyResponse>(route: .skip(id: todo._id))
              .execute { result in
                self.store.loading = false
                switch result {
                case .success:
                  self.store.updateCurrent()
                case .failure:
                  self.store.errorShown = true
                }
              }
          }) {
            ButtonEntryView(buttonImage: #imageLiteral(resourceName: "skip"), buttonText: "Skip")
          }
          Button(action: {
            self.store.loading = true
            TodoRoute<EmptyResponse>(route: .done(id: todo._id))
              .execute { result in
                self.store.loading = false
                switch result {
                case .success:
                  self.store.updateCurrent()
                case .failure:
                  self.store.errorShown = true
                }
              }
          }) {
            ButtonEntryView(buttonImage: #imageLiteral(resourceName: "done"), buttonText: "Done")
          }
        }
      }
    }
}

