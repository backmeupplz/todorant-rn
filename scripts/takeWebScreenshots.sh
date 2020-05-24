#!//bin/bash

# Copy screenshot files
cp scripts/screenshots/android/AppTest.java android/app/src/androidTest/java/com/todorant/AppTest.java
cp scripts/screenshots/android/Fastfile android/fastlane/Fastfile

cp scripts/screenshots/ios/Snapfile ios/fastlane/Snapfile
cp scripts/screenshots/ios/TodorantUITests.swift ios/TodorantUITests/TodorantUITests.swift

# Launch Android emulator
/Users/nikitakolmogorov/Library/Android/sdk/emulator/emulator -avd Pixel3API &
# Start server
yarn start &

# Create android screenshots
cd android
fastlane screenshots

# Create ios screenshots
cd ../ios
fastlane snapshot

# Reset
git reset --hard