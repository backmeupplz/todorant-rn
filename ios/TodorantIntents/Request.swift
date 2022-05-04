//
//  Request.swift
//  TodorantIntents
//
//  Created by Nikita Kolmogorov on 2019-10-08.
//  Copyright © 2019 Todorant. All rights reserved.
//

import Foundation
import Alamofire

enum Endpoint {}

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
    return ["token": "\(token)"]
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
