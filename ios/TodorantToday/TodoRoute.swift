//
//  TodoRoute.swift
//  TodorantToday
//
//  Created by Nikita Kolmogorov on 2019-10-09.
//  Copyright © 2019 Todorant. All rights reserved.
//

import Foundation
import Alamofire

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
    case .current: url = baseURL + Endpoint.TodoRoute.current.path
    case .done(let id): url = baseURL + Endpoint.TodoRoute.done(id: id).path
    case .skip(let id): url = baseURL + Endpoint.TodoRoute.skip(id: id).path
    case .delete(let id): url = baseURL + Endpoint.TodoRoute.delete(id: id).path
    }

    switch route {
    case .current: method = .get
    case .done, .skip: method = .put
    case .delete: method = .delete
    }

    switch route {
    default: encoding = URLEncoding.default
    }
  }
}

extension Endpoint {
  enum TodoRoute {
    case current
    case done(id: String)
    case skip(id: String)
    case delete(id: String)

    var path: String {
      switch self {
      case .current: return "current"
      case .done(let id): return "\(id)/done"
      case .skip(let id): return "\(id)/skip"
      case .delete(let id): return "\(id)"
      }
    }
  }
}
