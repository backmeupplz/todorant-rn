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
      
    sleep(20)
    
    if deviceLanguage == "ru" {
      app.buttons["Настройки, tab, 3 of 3"].tap()
      sleep(2)
      app.otherElements["delete"].tap()
      sleep(2)
      app.otherElements["add_ru"].tap()
      sleep(8)
      app.buttons["Текущее, tab, 1 of 3"].tap()
      snapshot("1Current")
      app.buttons["Планирование, tab, 2 of 3"].tap()
      snapshot("2Planning")
      sleep(2)
      app.buttons["Настройки, tab, 3 of 3"].tap()
      sleep(2)
      app.otherElements["delete"].tap()
      sleep(4)
      app.buttons["Текущее, tab, 1 of 3"].tap()
      snapshot("0Empty")
    } else if deviceLanguage == "uk" {
      app.buttons["Налаштування, tab, 3 of 3"].tap()
      sleep(2)
      app.otherElements["delete"].tap()
      sleep(2)
      app.otherElements["add_uk"].tap()
      sleep(8)
      app.buttons["Поточне, tab, 1 of 3"].tap()
      snapshot("1Current")
      app.buttons["Планування, tab, 2 of 3"].tap()
      snapshot("2Planning")
      sleep(2)
      app.buttons["Налаштування, tab, 3 of 3"].tap()
      sleep(2)
      app.otherElements["delete"].tap()
      sleep(4)
      app.buttons["Поточне, tab, 1 of 3"].tap()
      snapshot("0Empty")
    } else if deviceLanguage == "it" {
      app.buttons["Impostazioni, tab, 3 of 3"].tap()
      sleep(2)
      app.otherElements["delete"].tap()
      sleep(2)
      app.otherElements["add_it"].tap()
      sleep(8)
      app.buttons["Corrente, tab, 1 of 3"].tap()
      snapshot("1Current")
      app.buttons["Pianificazione, tab, 2 of 3"].tap()
      snapshot("2Planning")
      sleep(2)
      app.buttons["Impostazioni, tab, 3 of 3"].tap()
      sleep(2)
      app.otherElements["delete"].tap()
      sleep(4)
      app.buttons["Corrente, tab, 1 of 3"].tap()
      snapshot("0Empty")
    } else if deviceLanguage.contains("es") {
      app.buttons["Ajustes, tab, 3 of 3"].tap()
      sleep(2)
      app.otherElements["delete"].tap()
      sleep(2)
      app.otherElements["add_es"].tap()
      sleep(8)
      app.buttons["Actual, tab, 1 of 3"].tap()
      snapshot("1Current")
      app.buttons["Planeación, tab, 2 of 3"].tap()
      snapshot("2Planning")
      sleep(2)
      app.buttons["Ajustes, tab, 3 of 3"].tap()
      sleep(2)
      app.otherElements["delete"].tap()
      sleep(4)
      app.buttons["Actual, tab, 1 of 3"].tap()
      snapshot("0Empty")
    } else if deviceLanguage.contains("pt") {
      app.buttons["Configurações, tab, 3 of 3"].tap()
      sleep(2)
      app.otherElements["delete"].tap()
      sleep(2)
      app.otherElements["add_pt_br"].tap()
      sleep(8)
      app.buttons["Atual, tab, 1 of 3"].tap()
      snapshot("1Current")
      app.buttons["Planejamento, tab, 2 of 3"].tap()
      snapshot("2Planning")
      sleep(2)
      app.buttons["Configurações, tab, 3 of 3"].tap()
      sleep(2)
      app.otherElements["delete"].tap()
      sleep(4)
      app.buttons["Atual, tab, 1 of 3"].tap()
      snapshot("0Empty")
    } else {
      app.buttons["Settings, tab, 3 of 3"].tap()
      sleep(2)
      app.otherElements["delete"].tap()
      sleep(2)
      app.otherElements["add_en"].tap()
      sleep(8)
      app.buttons["Current, tab, 1 of 3"].tap()
      snapshot("1Current")
      app.buttons["Planning, tab, 2 of 3"].tap()
      snapshot("2Planning")
      sleep(2)
      app.buttons["Settings, tab, 3 of 3"].tap()
      sleep(2)
      app.otherElements["delete"].tap()
      sleep(4)
      app.buttons["Current, tab, 1 of 3"].tap()
      snapshot("0Empty")
    }
  }
}
