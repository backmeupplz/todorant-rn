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
  @Binding var isShowingButtonsView: Bool

  var body: some View {
    VStack {
      HStack {
        Button(action: {
          withAnimation {
            isShowingButtonsView = false
            store.updateCurrent()
          }
        }) {
          ButtonEntryView(buttonImage: #imageLiteral(resourceName: "refresh"))
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
                self.store.updateCurrent()
                self.store.errorShown = true
              }
            }
          withAnimation {
            isShowingButtonsView = false
          }
        }) {
          ButtonEntryView(buttonImage: #imageLiteral(resourceName: "delete"))
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
                self.store.updateCurrent()
                self.store.errorShown = true
              }
            }
          withAnimation {
            isShowingButtonsView = false
          }
        }) {
          ButtonEntryView(buttonImage: #imageLiteral(resourceName: "skip"))
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
                self.store.updateCurrent()
                self.store.errorShown = true
              }
            }
          WKInterfaceDevice.current().play(.success)
          withAnimation {
            isShowingButtonsView = false
          }
        }) {
          ButtonEntryView(buttonImage: #imageLiteral(resourceName: "done"))
        }
      }
      Spacer()
    }
    .padding(.top)
  }
}
