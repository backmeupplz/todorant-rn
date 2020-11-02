//
//  IntentHandler.swift
//  TodorantIntents
//
//  Created by Nikita Kolmogorov on 2019-10-08.
//  Copyright © 2019 Todorant. All rights reserved.
//

import Intents
import KeychainAccess

enum Key: String {
  case accessToken
}

final class UserSession {
  static var accessToken: String? {
    try? Keychain(service: "com.todorant.app", accessGroup: "ACWP4F58HZ.shared").getString(Key.accessToken.rawValue)
  }
}

class IntentHandler: INExtension, INAddTasksIntentHandling {

  func handle(intent: INAddTasksIntent, completion: @escaping (INAddTasksIntentResponse) -> Void) {
    guard let phrase = intent.taskTitles?.first,
      UserSession.accessToken != nil else {
      completion(INAddTasksIntentResponse(
        code: .failureRequiringAppLaunch,
        userActivity: nil))
        return
    }
    TodoRoute<EmptyResponse>(route: .add, parameters: [
      "text": phrase,
      "monthAndYear": String.today.prefix(7),
      "date": String.today.suffix(2)
    ])
      .execute { result in
        switch result {
        case .success:
          completion(INAddTasksIntentResponse(
            code: .success, userActivity: nil))
        case .failure:
          completion(INAddTasksIntentResponse(
            code: .failureRequiringAppLaunch, userActivity: nil))
        }
      }
  }

  func resolveTaskTitles(
    for intent: INAddTasksIntent,
    with completion: @escaping ([INSpeakableStringResolutionResult]) -> Void) {
    guard let spokenPhrases = intent.taskTitles,
      spokenPhrases.count != 0 else {
        completion([.needsValue()])
        return
    }
    completion([INSpeakableStringResolutionResult.confirmationRequired(with: spokenPhrases[0])])
  }

}
