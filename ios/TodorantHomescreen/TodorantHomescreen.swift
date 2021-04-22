//
//  TodorantHomescreen.swift
//  TodorantHomescreen
//
//  Created by Yakov Karpov on 02.10.2020.
//  Copyright © 2020 Todorant. All rights reserved.
//

import SwiftUI
import WidgetKit

let snapshotText = NSLocalizedString("snapshot", comment: "")
let titleText = NSLocalizedString("title", comment: "")
let descriptionText = NSLocalizedString("description", comment: "")



struct TodoStatusProvider: TimelineProvider {
  let store = Store.shared

  func placeholder(in _: Context) -> TodoWidgetContent {
    TodoWidgetContent(
      currentProgress: 1,
      maximumProgress: 3,
      text: snapshotText,
      warning: nil
    )
  }

  func getSnapshot(in _: Context, completion: @escaping (TodoWidgetContent) -> Void) {
    store.updateCurrent()
    let entry = TodoWidgetContent(
      currentProgress: 1,
      maximumProgress: 3,
      text: snapshotText,
      warning: nil
    )
    completion(entry)
  }
  
  private func getCurrentTime() -> String {
    let now = Date()
    let formatter = DateFormatter()
    formatter.timeZone = TimeZone.current
    formatter.dateFormat = "MM-dd HH:mm"
    return NSLocalizedString("timesStamp", comment: "") + " " + formatter.string(from: now)
  }

  func getTimeline(in _: Context, completion: @escaping (Timeline<Entry>) -> Void) {
    store.updateCurrent {
      var entries: [TodoWidgetContent] = []

      
      if let currentState = store.currentState {
        
        let warning = store.errorShown ? getCurrentTime() : getCurrentTime()
        
        if let todo = currentState.todo {
          let todoEntry = TodoWidgetContent(
            currentProgress: currentState.todosCount - currentState.incompleteTodosCount,
            maximumProgress: currentState.todosCount,
            text: "\(todo.frog ? "🐸 " : "")\(todo.time != nil ? "\(todo.time ?? "") " : "")\(todo.text.stringWithLinksTruncated())", warning: warning
          )
          entries.append(todoEntry)
        } else if currentState.todosCount <= 0{
          let emptyViewText = NSLocalizedString("empty.subtitle", comment: "")
          let todoEntry = TodoWidgetContent(title: "🐝", text: emptyViewText, warning: warning)
          entries.append(todoEntry)
        } else if currentState.todosCount > 0 && currentState.incompleteTodosCount == 0 {
          let clearViewText = NSLocalizedString("clear.subtitle", comment: "")
          let todoEntry = TodoWidgetContent(title: "🎉", text: clearViewText, warning: warning)
          entries.append(todoEntry)
        }
      } else if !store.authenticated {
        let authenticateText = NSLocalizedString("authenticate", comment: "")
        let todoEntry = TodoWidgetContent(text: authenticateText)
        entries.append(todoEntry)
      } else if store.errorShown {
        let errorText = NSLocalizedString("error", comment: "")
        let todoEntry = TodoWidgetContent(text: errorText)
        entries.append(todoEntry)
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
