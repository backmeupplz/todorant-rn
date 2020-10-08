//
//  TodorantWidget.swift
//  TodorantWidget
//
//  Created by Yakov Karpov on 02.10.2020.
//  Copyright © 2020 Todorant. All rights reserved.
//

import SwiftUI
import WidgetKit

let snapshotText = NSLocalizedString("snapshot", comment: "")
let titleText = NSLocalizedString("title", comment: "")
let descriptionText = NSLocalizedString("description", comment: "")

let snapshotEntry = TodoWidgetContent(
  currentProgress: 1,
  maximumProgress: 3,
  text: snapshotText
)

struct TodoStatusProvider: TimelineProvider {
  let store = Store()

  func placeholder(in _: Context) -> TodoWidgetContent {
    snapshotEntry
  }

  func getSnapshot(in _: Context, completion: @escaping (TodoWidgetContent) -> Void) {
    store.updateCurrent()
    let entry = snapshotEntry
    completion(entry)
  }

  func getTimeline(in _: Context, completion: @escaping (Timeline<Entry>) -> Void) {
    store.updateCurrent {
      var entries: [TodoWidgetContent] = []

      if !store.authenticated {
        let authenticateText = NSLocalizedString("authenticate", comment: "")
        let todoEntry = TodoWidgetContent(text: authenticateText)
        entries.append(todoEntry)
      } else if store.errorShown {
//        let errorText = NSLocalizedString("error", comment: "")
//        let todoEntry = TodoWidgetContent(text: errorText)
//        entries.append(todoEntry)
      } else {
        store.currentState.map { currentState in
          currentState.todo.map { todo in
            let todoEntry = TodoWidgetContent(
              currentProgress: currentState.todosCount - currentState.incompleteTodosCount,
              maximumProgress: currentState.todosCount,
              text: "\(todo.frog ? "🐸 " : "")\(todo.time != nil ? "\(todo.time ?? "")" : "")\(todo.text)"
            )
            entries.append(todoEntry)
          }
          if currentState.todosCount <= 0 {
            let emptyViewText = NSLocalizedString("empty.subtitle", comment: "")
            let todoEntry = TodoWidgetContent(title: "🐝", text: emptyViewText)
            entries.append(todoEntry)
          } else if currentState.todosCount > 0 && currentState.incompleteTodosCount == 0 {
            let clearViewText = NSLocalizedString("clear.subtitle", comment: "")
            let todoEntry = TodoWidgetContent(title: "🎉", text: clearViewText)
            entries.append(todoEntry)
          }
        }
      }

      let timeline = Timeline(entries: entries, policy: .atEnd)

      completion(timeline)
    }
  }
}

@main
struct TodorantWidget: Widget {
  let kind: String = "TodorantWidget"

  var body: some WidgetConfiguration {
    StaticConfiguration(
      kind: kind,
      provider: TodoStatusProvider()
    ) { entry in
      TodoEntryView(model: entry)
    }
    .configurationDisplayName(titleText)
    .description(descriptionText)
  }
}
