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

    var settings = "Settings"
    var current = "Current"
    var planning = "Planning"
    var addTodosButton = "add_en"

    if deviceLanguage == "ru" {
      settings = "Настройки"
      current = "Текущее"
      planning = "Планирование"
      addTodosButton = "add_ru"
    } else if deviceLanguage == "uk" {
      settings = "Налаштування"
      current = "Поточне"
      planning = "Планування"
      addTodosButton = "add_uk"
    } else if deviceLanguage == "it" {
      settings = "Impostazioni"
      current = "Corrente"
      planning = "Pianificazione"
      addTodosButton = "add_it"
    } else if deviceLanguage.contains("es") {
      settings = "Ajustes"
      current = "Actual"
      planning = "Planeación"
      addTodosButton = "add_es"
    } else if deviceLanguage.contains("pt") {
      settings = "Configurações"
      current = "Atual"
      planning = "Planejamento"
      addTodosButton = "add_pt_br"
    }
      
    sleep(20)

    // Add todos
    app.buttons["\(settings), tab, 3 of 3"].tap()
    sleep(2)
    app.otherElements["\(addTodosButton)"].tap()
    sleep(8)
    // Filled current
    app.buttons["\(current), tab, 1 of 3"].tap()
    sleep(2)
    snapshot("1Current")
    // Filled planning
    app.buttons["\(planning), tab, 2 of 3"].tap()
    sleep(2)
    snapshot("2Planning")
    // Dark mode
    app.buttons["\(settings), tab, 3 of 3"].tap()
    sleep(2)
    app.otherElements["turn_dark_on"].tap()
    sleep(2)
    // Filled current
    app.buttons["\(current), tab, 1 of 3"].tap()
    sleep(2)
    snapshot("1CurrentDark")
    // Filled planning
    app.buttons["\(planning), tab, 2 of 3"].tap()
    sleep(2)
    snapshot("2PlanningDark")
  }
}
