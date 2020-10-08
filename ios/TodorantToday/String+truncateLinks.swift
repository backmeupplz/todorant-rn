//
//  String+truncateLinks.swift
//  TodorantToday
//
//  Created by Nikita Kolmogorov on 2020-10-08.
//  Copyright © 2020 Facebook. All rights reserved.
//

import Foundation

extension String {
  func stringWithLinksTruncated() -> String {
    let types: NSTextCheckingResult.CheckingType = [.link]
    guard let detector = try? NSDataDetector(types: types.rawValue) else {
      return self
    }
    let matches = detector.matches(in: self, options: [], range: NSRange(location: 0, length: self.utf16.count))
    var reduction = 0
    var result = self
    for match in matches {
      let range = NSRange(location: match.range.location - reduction, length: match.range.length)
      guard let swiftRange = Range(range, in: self) else { continue }
      let urlString = String(self[swiftRange])
      guard let url = URL(string: urlString) else { continue }
      guard var host = url.host, host.count > 0 else { continue }
      if url.path.count > 0 {
        host = "\(host)/..."
      }
      result.replaceSubrange(swiftRange, with: host)
      reduction += range.length - host.count
    }
    
    return result
  }
}
