// RN 64.*package com.todorant;
// RN 64.*
// RN 64.*import com.facebook.react.bridge.JSIModuleSpec;
// RN 64.*import com.facebook.react.bridge.JavaScriptContextHolder;
// RN 64.*import com.facebook.react.bridge.ReactApplicationContext;
// RN 64.*import com.swmansion.reanimated.ReanimatedJSIModulePackage;
// RN 64.*import com.reactnativemmkv.MmkvModule;
// RN 64.*import com.reactnativemultithreading.MultithreadingModule;
// RN 64.*import com.nozbe.watermelondb.jsi.WatermelonDBJSIPackage; 
// RN 64.*import com.ammarahmed.mmkv.RNMMKVModule;
// RN 64.*
// RN 64.*import java.util.Collections;
// RN 64.*import java.util.List;
// RN 64.*
// RN 64.*// TODO: Remove all of this when MMKV and Reanimated can be autoinstalled (maybe RN 0.65)
// RN 64.*public class ExampleJSIPackage extends ReanimatedJSIModulePackage {
// RN 64.*    @Override
// RN 64.*    public List<JSIModuleSpec> getJSIModules(ReactApplicationContext reactApplicationContext, JavaScriptContextHolder jsContext) {
// RN 64.*        super.getJSIModules(reactApplicationContext, jsContext);
// RN 64.*        MultithreadingModule.install(reactApplicationContext, jsContext);
// RN 64.*        reactApplicationContext.getNativeModule(RNMMKVModule.class).installLib(jsContext, reactApplicationContext.getFilesDir().getAbsolutePath() + "/mmkv");
// RN 64.*        WatermelonDBJSIPackage wmdb = new WatermelonDBJSIPackage();
// RN 64.*        return wmdb.getJSIModules(reactApplicationContext, jsContext);
// RN 64.*    }
// RN 64.*}