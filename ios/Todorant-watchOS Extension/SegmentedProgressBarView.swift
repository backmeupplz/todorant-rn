//
//  SegmentedProgressBarView.swift
//  Todorant
//
//  Created by Яков Карпов on 28.10.2020.
//  Copyright © 2020 Facebook. All rights reserved.
//

import SwiftUI

struct SegmentedProgressBarView: View {
  var currentProgress: Int
  var maximumProgress: Int

  var body: some View {
    HStack {
      Text(String(currentProgress))
        .font(.headline)
        .foregroundColor(.progressBar)

      maximumProgress < Config.segmetThreshold ? AnyView(SegmentedProgressBarView.SegmentedProgressBar(
        currentProgress: currentProgress,
        maximumProgress: maximumProgress
      )) :
        AnyView(SegmentedProgressBarView.LinearProgressBar(
          currentProgress: currentProgress,
          maximumProgress: maximumProgress
        ))

      Text(String(maximumProgress))
        .font(.headline)
        .foregroundColor(.progressBar)
    }
  }
}

private extension SegmentedProgressBarView {
  struct SegmentedProgressBar: View {
    var currentProgress: Int
    var maximumProgress: Int

    var body: some View {
      HStack(spacing: Config.segmentSpacing) {
        ForEach(0 ..< maximumProgress) { index in
          Capsule()
            .foregroundColor(index < self.currentProgress ? Config.selectedColor : Config
              .unselectedColor)
        }
      }
      .frame(maxHeight: Config.progressBarHeight)
    }
  }

  struct LinearProgressBar: View {
    var currentProgress: Int
    var maximumProgress: Int

    var body: some View {
      GeometryReader { geometry in
        ZStack(alignment: .leading) {
          Rectangle().frame(width: geometry.size.width)
            .foregroundColor(Config.unselectedColor)

          Rectangle()
            .frame(width: CGFloat(Int(geometry.size.width) / maximumProgress * currentProgress))
            .foregroundColor(Config.selectedColor)
        }
      }
      .frame(maxHeight: Config.progressBarHeight)
    }
  }
}

fileprivate enum Config {
  static let selectedColor: Color = .progressBar
  static let unselectedColor: Color = Color.secondary.opacity(0.3)
  static let segmentSpacing: CGFloat = 3
  static let segmetThreshold = 10
  static let progressBarHeight: CGFloat = 2
}
