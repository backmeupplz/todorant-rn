package com.todorant;

import com.facebook.react.bridge.JSIModuleSpec;
import com.facebook.react.bridge.JavaScriptContextHolder;
import com.facebook.react.bridge.ReactApplicationContext;
import com.swmansion.reanimated.ReanimatedJSIModulePackage;
// import com.reactnativemmkv.MmkvModule;
// import com.reactnativemultithreading.MultithreadingModule;
import com.nozbe.watermelondb.jsi.WatermelonDBJSIPackage; 
import com.ammarahmed.mmkv.RNMMKVModule;

import java.util.Collections;
import java.util.List;

// TODO: Remove all of this when MMKV and Reanimated can be autoinstalled (maybe RN 0.65)
public class ExampleJSIPackage extends ReanimatedJSIModulePackage {
    @Override
    public List<JSIModuleSpec> getJSIModules(ReactApplicationContext reactApplicationContext, JavaScriptContextHolder jsContext) {
        super.getJSIModules(reactApplicationContext, jsContext);
        // MultithreadingModule.install(reactApplicationContext, jsContext);
        reactApplicationContext.getNativeModule(RNMMKVModule.class).installLib(jsContext, reactApplicationContext.getFilesDir().getAbsolutePath() + "/mmkv");
        WatermelonDBJSIPackage wmdb = new WatermelonDBJSIPackage();
        return wmdb.getJSIModules(reactApplicationContext, jsContext);
    }
}