//
//  KeychainManagerBridge.m
//  Todorant
//
//  Created by Nikita Kolmogorov on 2020-03-20.
//  Copyright © 2020 Facebook. All rights reserved.
//

#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(KeychainManager, NSObject)

RCT_EXTERN_METHOD(setToken:(NSString *)token)
RCT_EXTERN_METHOD(removeToken)

@end
