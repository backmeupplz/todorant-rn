//
//  ActivityIndicator.swift
//  TodorantToday
//
//  Created by Nikita Kolmogorov on 2019-10-09.
//  Copyright © 2019 Todorant. All rights reserved.
//

import SwiftUI

struct ActivityIndicator: UIViewRepresentable {
    func makeUIView(
      context: UIViewRepresentableContext<ActivityIndicator>
    ) -> UIActivityIndicatorView {
      let view = UIActivityIndicatorView(style: .large)
      view.startAnimating()
      return view
    }

    func updateUIView(
      _ uiView: UIActivityIndicatorView,
      context: UIViewRepresentableContext<ActivityIndicator>
    ) {
    }
}
