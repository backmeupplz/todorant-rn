#!//bin/bash

# Copy screenshot files
cp scripts/screenshots/android/AppTest.java android/app/src/androidTest/java/com/todorant/AppTest.java
cp scripts/screenshots/android/Fastfile android/fastlane/Fastfile

# Launch Android emulator
/Users/nikitakolmogorov/Library/Android/sdk/emulator/emulator -avd Pixel3API &

# Create android screenshots
cd android
fastlane screenshots

# Create ios screenshots
cd ../ios
fastlane snapshot