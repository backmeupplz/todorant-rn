//
//  ProgressBarView.swift
//  TodorantToday
//
//  Created by Yakov Karpov on 25.09.2020.
//  Copyright © 2020 Todorant. All rights reserved.
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

      maximumProgress < 15 ? AnyView(SegmentedProgressBarView.SegmentedProgressBar(
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
    var spacing: CGFloat = 3
    var selectedColor: Color = .progressBar
    var unselectedColor = Color.secondary.opacity(0.3)

    var body: some View {
      HStack(spacing: spacing) {
        ForEach(0 ..< maximumProgress) { index in
          Capsule()
            .foregroundColor(index < self.currentProgress ? self.selectedColor : self
              .unselectedColor)
        }
      }
      .frame(maxHeight: 2)
      .clipShape(Capsule())
    }
  }

  struct LinearProgressBar: View {
    var currentProgress: Int
    var maximumProgress: Int
    var selectedColor: Color = .progressBar
    var unselectedColor = Color.secondary.opacity(0.3)

    var body: some View {
      GeometryReader { geometry in
        ZStack(alignment: .leading) {
          Rectangle().frame(width: geometry.size.width)
            .foregroundColor(self.unselectedColor)

          Rectangle()
            .frame(width: CGFloat(Int(geometry.size.width) / maximumProgress * currentProgress))
            .foregroundColor(self.selectedColor)
        }
      }
      .frame(maxHeight: 2)
      .clipShape(Capsule())
    }
  }
}
