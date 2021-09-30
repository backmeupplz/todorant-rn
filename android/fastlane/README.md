fastlane documentation
================
# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```
xcode-select --install
```

Install _fastlane_ using
```
[sudo] gem install fastlane -NV
```
or alternatively using `brew install fastlane`

# Available Actions
## Android
### android build_for_screengrab
```
fastlane android build_for_screengrab
```
Build debug and test APK for screenshots
### android take_screenshots
```
fastlane android take_screenshots
```

### android copy_es_screenshots
```
fastlane android copy_es_screenshots
```

### android remove_unframed_screenshots
```
fastlane android remove_unframed_screenshots
```

### android frame
```
fastlane android frame
```

### android upload_screenshots
```
fastlane android upload_screenshots
```

### android screenshots
```
fastlane android screenshots
```

### android increment_android_versions
```
fastlane android increment_android_versions
```

### android commit_and_push_android_release
```
fastlane android commit_and_push_android_release
```

### android commit_and_push_android_release_beta
```
fastlane android commit_and_push_android_release_beta
```

### android release
```
fastlane android release
```

### android release_beta
```
fastlane android release_beta
```

### android release_appgallery
```
fastlane android release_appgallery
```


----

This README.md is auto-generated and will be re-generated every time [fastlane](https://fastlane.tools) is run.
More information about fastlane can be found on [fastlane.tools](https://fastlane.tools).
The documentation of fastlane can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
