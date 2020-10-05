//
//  TodorantWidget.swift
//  TodorantWidget
//
//  Created by Yakov Karpov on 02.10.2020.
//  Copyright © 2020 Todorant. All rights reserved.
//

import SwiftUI
import WidgetKit

let snapshotEntry = TodoWidgetContent(currentProgress: 1, maximumProgress: 3,
                                      todoText: "Buy soy milk")

struct TodoStatusProvider: TimelineProvider {
  // TODO: - Fetch data into the Store and update widget using
//   WidgetCenter.shared.reloadTimelines(ofKind: "TodorantWidget")

  let store: Store

  func placeholder(in _: Context) -> TodoWidgetContent {
    snapshotEntry
  }

  func getSnapshot(in _: Context, completion: @escaping (TodoWidgetContent) -> Void) {
    let entry = snapshotEntry
    completion(entry)
  }

  func getTimeline(in _: Context, completion: @escaping (Timeline<Entry>) -> Void) {
    var entries: [TodoWidgetContent] = []

    store.currentState.map { currentState in
      currentState.todo.map { todo in

        let todoEntry = TodoWidgetContent(
          currentProgress: currentState.todosCount - currentState.incompleteTodosCount,
          maximumProgress: currentState.todosCount,
          todoText: "\(todo.frog ? "🐸 " : "")\(todo.time != nil ? "\(todo.time ?? "")" : "")\(todo.text)"
        )

        entries.append(todoEntry)
      }
    }

    let timeline = Timeline(entries: entries, policy: .never)

    completion(timeline)
  }
}

@main
struct TodorantWidget: Widget {
  let kind: String = "TodorantWidget"

  let store = Store()

  var body: some WidgetConfiguration {
    StaticConfiguration(
      kind: kind,
      provider: TodoStatusProvider(store: store)
    ) { entry in
      TodoEntryView(model: entry)
    }
    .configurationDisplayName("Todorant widget")
    .description("Displays your current task and progress in real time.")
  }
}
