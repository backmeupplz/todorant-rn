//
//  TodayViewController.swift
//  TodorantToday
//
//  Created by Nikita Kolmogorov on 2019-10-09.
//  Copyright © 2019 Todorant. All rights reserved.
//

import UIKit
import NotificationCenter
import SwiftUI

class TodayViewController: UIViewController, NCWidgetProviding {
  var childView: UIViewController?
  let store = Store()

  override func viewDidLoad() {
    super.viewDidLoad()

    extensionContext?.widgetLargestAvailableDisplayMode = .expanded
  }

  override func viewDidAppear(_ animated: Bool) {
    store.updateCurrent()

    if childView != nil {
      return
    }
    guard let extensionContext = self.extensionContext else {
      return
    }
    childView = UIHostingController(rootView:
      CurrentView(extensionContext: extensionContext)
        .environmentObject(store)
        .padding()
    )
    guard let childView = childView else {
      return
    }
    addChild(childView)
    childView.view.frame = view.frame
    childView.view.backgroundColor = UIColor.clear
    view.addSubview(childView.view)
    view.backgroundColor = UIColor.clear
    childView.didMove(toParent: self)
  }

  func widgetPerformUpdate(completionHandler: (@escaping (NCUpdateResult) -> Void)) {
    completionHandler(NCUpdateResult.newData)
  }

  func widgetActiveDisplayModeDidChange(_ activeDisplayMode: NCWidgetDisplayMode, withMaximumSize maxSize: CGSize) {
    if activeDisplayMode == .expanded {
      guard let currentState = store.currentState,
        let todo = currentState.todo else {
        preferredContentSize = CGSize(width: 0, height: 110)
        return
      }
      let text = "\(todo.frog ? "🐸 " : "")\(todo.text)"
      let height = estimatedLabelHeight(text: text,
                                        width: maxSize.width)
      preferredContentSize = CGSize(width: 0,
                                    height: height)
      store.expanded = true
    } else {
      preferredContentSize = maxSize
      store.expanded = false
    }
  }

  func estimatedLabelHeight(
    text: String,
    width: CGFloat
  ) -> CGFloat {
    let label = UILabel()
    let size = CGSize(width: width, height: 1000)
    let options = NSStringDrawingOptions.usesFontLeading.union(.usesLineFragmentOrigin)
    let attributes = [NSAttributedString.Key.font: label.font]
    let rectangleHeight = String(text)
      .boundingRect(with: size,
                    options: options,
                    attributes: attributes as [NSAttributedString.Key: Any],
                    context: nil).height
    return rectangleHeight + 75
  }
}
