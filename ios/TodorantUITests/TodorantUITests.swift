//
//  TodorantUITests.swift
//  TodorantUITests
//
//  Created by Nikita Kolmogorov on 2020-03-21.
//  Copyright © 2020 Facebook. All rights reserved.
//

import XCTest

class TodorantUITests: XCTestCase {
  override func setUp() {
    super.setUp()

    let app = XCUIApplication()

    app.launchEnvironment = ProcessInfo.processInfo.environment
    setupSnapshot(app, waitForAnimations: true)
    app.launch()
  }
  
    func testScreenshots() {
    let app = XCUIApplication()
      
    sleep(10)
    
    snapshot("0Empty")
    if deviceLanguage == "ru" {
      app.buttons["Настройки, tab, 3 of 3"].tap()
      sleep(2)
      app.otherElements["delete"].tap()
      sleep(2)
      app.otherElements["add_ru"].tap()
      sleep(2)
      app.buttons["Текущее, tab, 1 of 3"].tap()
      snapshot("1Current")
      app.buttons["Планирование, tab, 2 of 3"].tap()
      snapshot("2Planning")
    } else if deviceLanguage == "uk" {
      app.buttons["Налаштування, tab, 3 of 3"].tap()
      sleep(2)
      app.otherElements["delete"].tap()
      sleep(2)
      app.otherElements["add_uk"].tap()
      sleep(2)
      app.buttons["Поточне, tab, 1 of 3"].tap()
      snapshot("1Current")
      app.buttons["Планування, tab, 2 of 3"].tap()
      snapshot("2Planning")
    } else {
      app.buttons["Settings, tab, 3 of 3"].tap()
      sleep(2)
      app.otherElements["delete"].tap()
      sleep(2)
      app.otherElements["add_en"].tap()
      sleep(2)
      app.buttons["Current, tab, 1 of 3"].tap()
      snapshot("1Current")
      app.buttons["Planning, tab, 2 of 3"].tap()
      snapshot("2Planning")
    }
  }
}
