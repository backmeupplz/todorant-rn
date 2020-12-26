//
//  ComplicationController.swift
//  Todorant-watchOS Extension
//
//  Created by Яков Карпов on 28.10.2020.
//  Copyright © 2020 Facebook. All rights reserved.
//

import ClockKit

class ComplicationController: NSObject, CLKComplicationDataSource {
  // MARK: - Complication Configuration

  func getComplicationDescriptors(handler: @escaping ([CLKComplicationDescriptor]) -> Void) {
    let descriptors = [
      CLKComplicationDescriptor(
        identifier: "complication",
        displayName: "Todorant",
        supportedFamilies: [
          CLKComplicationFamily.graphicCircular,
          //CLKComplicationFamily.graphicCorner,
          CLKComplicationFamily.graphicExtraLarge,
          //CLKComplicationFamily.utilitarianSmall,
        ]
      ),
    ]
    handler(descriptors)
  }

  func handleSharedComplicationDescriptors(_: [CLKComplicationDescriptor]) {
    // Do any necessary work to support these newly shared complication descriptors
  }

  // MARK: - Timeline Configuration

  func getTimelineEndDate(for _: CLKComplication,
                          withHandler handler: @escaping (Date?) -> Void)
  {
    // Call the handler with the last entry date you can currently provide or nil if you can't support future timelines
    handler(nil)
  }

  func getPrivacyBehavior(
    for _: CLKComplication,
    withHandler handler: @escaping (CLKComplicationPrivacyBehavior) -> Void
  ) {
    // Call the handler with your desired behavior when the device is locked
    handler(.showOnLockScreen)
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

  func getComplicationTemplate(for complication: CLKComplication,
                               using _: Date) -> CLKComplicationTemplate?
  {
    switch complication.family {
    case .graphicCircular:
      guard let image = UIImage(named: "Complication/Graphic Circular") else {
        fatalError("Unable to load an image")
      }
      let loadedImageProvider = CLKFullColorImageProvider(fullColorImage: image)
      return CLKComplicationTemplateGraphicCircularImage(
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

    default:
      return nil
    }
  }

  func getTimelineEntries(
    for _: CLKComplication,
    after _: Date,
    limit _: Int,
    withHandler handler: @escaping ([CLKComplicationTimelineEntry]?) -> Void
  ) {
    // Call the handler with the timeline entries after the given date
    handler(nil)
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
}
