//
//  ComplicationController.swift
//  Todorant-watchOS Extension
//
//  Created by Яков Карпов on 28.10.2020.
//  Copyright © 2020 Facebook. All rights reserved.
//

import ClockKit
import SwiftUI

class ComplicationController: NSObject, CLKComplicationDataSource {
  
  private let dataOperator = ComplicationDataOperator()
  var store = Store()
  
  // MARK: - Complication Descriptors Configuration

  func getComplicationDescriptors(handler: @escaping ([CLKComplicationDescriptor]) -> Void) {
    let descriptors = [
      CLKComplicationDescriptor(
        identifier: "complication",
        displayName: "Todorant",
        supportedFamilies: [
          CLKComplicationFamily.circularSmall,
          CLKComplicationFamily.graphicCircular,
          CLKComplicationFamily.graphicCorner,
          CLKComplicationFamily.graphicExtraLarge,
          CLKComplicationFamily.utilitarianSmall,
          CLKComplicationFamily.graphicRectangular
        ]
      ),
    ]
    handler(descriptors)
  }

  // MARK: - Timeline Population

  func getCurrentTimelineEntry(
    for complication: CLKComplication,
    withHandler handler: @escaping (CLKComplicationTimelineEntry?) -> Void
  ) {
    if let template = getComplicationTemplate(for: complication, using: Date()) {
      let entry = CLKComplicationTimelineEntry(
        date: Date(),
        complicationTemplate: template
      )
      handler(entry)
    } else {
      handler(nil)
    }
  }

  // MARK: - Timeline Entries Configuration

  func getTimelineEntries(
    for complication: CLKComplication,
    after _: Date,
    limit _: Int,
    withHandler handler: @escaping ([CLKComplicationTimelineEntry]?) -> Void
  ) {
    if let template = getComplicationTemplate(for: complication, using: Date()) {
      let entry = CLKComplicationTimelineEntry(
        date: Date(),
        complicationTemplate: template
      )
      handler([entry])
    } else {
      handler(nil)
    }
  }

  // MARK: - Templates Configuration

  func getComplicationTemplate(for complication: CLKComplication,
                               using _: Date) -> CLKComplicationTemplate?
  {
    switch complication.family {
    
    case .graphicCircular:
      let data = dataOperator.getGraphicCircularData(store: store)
      return CLKComplicationTemplateGraphicCircularView(GraphicCircularComplicationView(complicationData: data))
      
    case .graphicRectangular:
      let data = dataOperator.getGraphicRectangularData(store: store)
      return CLKComplicationTemplateGraphicRectangularFullView(GraphicRectangularComplicationView(complicationData: data))
    
    case .circularSmall:
      guard let image = UIImage(named: "Complication/Circular") else {
        fatalError("Unable to load an image")
      }
      let loadedImageProvider = CLKImageProvider(onePieceImage: image)
      return CLKComplicationTemplateCircularSmallSimpleImage(
        imageProvider: loadedImageProvider
      )
      
    case .graphicCorner:
      guard let image = UIImage(named: "Complication/Graphic Corner") else {
        fatalError("Unable to load an image")
      }
      let loadedImageProvider = CLKFullColorImageProvider(fullColorImage: image)
      return CLKComplicationTemplateGraphicCornerCircularImage(
        imageProvider: loadedImageProvider
      )
      
    case .graphicExtraLarge:
      guard let image = UIImage(named: "Complication/Graphic Extra Large") else {
        fatalError("Unable to load an image")
      }
      let loadedImageProvider = CLKFullColorImageProvider(fullColorImage: image)
      return CLKComplicationTemplateGraphicExtraLargeCircularImage(
        imageProvider: loadedImageProvider
      )
      
    case .utilitarianSmall:
      guard let image = UIImage(named: "Complication/Utilitarian") else {
        fatalError("Unable to load an image")
      }
      let loadedImageProvider = CLKImageProvider(onePieceImage: image)
      return CLKComplicationTemplateUtilitarianSmallSquare(
        imageProvider: loadedImageProvider
      )
      
    default:
      return nil
    }
  }
  
    // MARK: - Sample Templates

    func getLocalizableSampleTemplate(
      for complication: CLKComplication,
      withHandler handler: @escaping (CLKComplicationTemplate?) -> Void
    ) {
      let template = getComplicationTemplate(for: complication, using: Date())
      if let t = template {
        handler(t)
      } else {
        handler(nil)
      }
    }

  // MARK: - Privacy Configuration

  func getPrivacyBehavior(
    for _: CLKComplication,
    withHandler handler: @escaping (CLKComplicationPrivacyBehavior) -> Void
  ) { handler(.showOnLockScreen) }
  
  // MARK: - Private Functions
  
  

}
