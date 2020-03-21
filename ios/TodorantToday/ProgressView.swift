//
//  ProgressView.swift
//  TodorantToday
//
//  Created by Nikita Kolmogorov on 2019-10-09.
//  Copyright © 2019 Todorant. All rights reserved.
//
import SwiftUI

struct ProgressView: UIViewRepresentable {
    var progress: Float

    func makeUIView(
      context: UIViewRepresentableContext<ProgressView>
    ) -> UIProgressView {
      return UIProgressView(progressViewStyle: .default)
    }

    func updateUIView(
      _ uiView: UIProgressView,
      context: UIViewRepresentableContext<ProgressView>
    ) {
      uiView.setProgress(progress, animated: false)
    }
}
