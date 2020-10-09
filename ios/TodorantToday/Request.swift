//
//  Request.swift
//  TodorantToday
//
//  Created by Nikita Kolmogorov on 2019-10-09.
//  Copyright © 2019 Todorant. All rights reserved.
//

import Foundation
import Alamofire

enum Endpoint {}

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

class EmptyResponse: Codable {
}

protocol Request {
  associatedtype CodableStruct: Codable
  typealias CodableResponse = (Result<CodableStruct?, Error>) -> Void
  var url: URLConvertible { get }
  var parameters: Parameters? { get }
  var headers: HTTPHeaders? { get }
  var method: HTTPMethod { get }
  func execute(interceptor: RequestInterceptor?, _ completion: @escaping CodableResponse)
}

extension Request {
  var headers: HTTPHeaders? {
    guard let token = UserSession.accessToken else { return nil }
    guard let password = UserSession.password, password.count > 0 else {
      return ["token": "\(token)"]
    }
    return ["token": "\(token)", "passwordToDecrypt": "\(password)"]
  }
  var encoding: ParameterEncoding {
    return URLEncoding.default
  }
  func execute(interceptor: RequestInterceptor? = nil, _ completion: @escaping CodableResponse) {
    AF.request(url,
               method: method,
               parameters: parameters,
               encoding: encoding,
               headers: headers,
               interceptor: interceptor)
      .responseJSON {
        if let data = $0.data {
          do {
            if CodableStruct.self == EmptyResponse.self {
              DispatchQueue.main.async {
                completion(.success(nil))
              }
            } else {
              let parsed = try JSONDecoder().decode(CodableStruct.self, from: data)
              DispatchQueue.main.async {
                completion(.success(parsed))
              }
            }
          } catch {
            DispatchQueue.main.async {
              completion(.failure(error))
            }
          }
        } else {
          DispatchQueue.main.async {
            completion(
              .failure(TodorantError
                .networkError("Server request failed"))
            )
          }
        }
    }
  }
}
