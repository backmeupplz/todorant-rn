//
//  TodoRoute.swift
//  TodorantIntents
//
//  Created by Nikita Kolmogorov on 2019-10-08.
//  Copyright © 2019 Todorant. All rights reserved.
//

import Foundation
import Alamofire

enum TodorantURL {
  static let base = "https://backend.todorant.com/"
}

enum TodorantError: Error {
  case networkError(String)
}

extension TodorantError: CustomStringConvertible {
  var description: String {
    return "Something went wrong"
  }
}

struct TodoRoute<T: Codable>: Request {
  private var baseURL = TodorantURL.base + "todo/"

  typealias CodableStruct = T
  var url: URLConvertible
  var parameters: Parameters?
  var method: HTTPMethod

  var encoding: ParameterEncoding

  init(route: Endpoint.TodoRoute, parameters: Parameters? = nil) {
    self.parameters = parameters

    switch route {
    case .add: url = baseURL
    }

    switch route {
    case .add: method = .post
    }

    switch route {
    case .add: encoding = JSONEncoding.default
    }
  }
}

extension Endpoint {
  enum TodoRoute {
    case add

    var path: String {
      switch self {
      default: return ""
      }
    }
  }
}
