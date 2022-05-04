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

# Crop and move screenshots for android
cd ..
mkdir scripts/screenshots/tmp
for i in $(find android/fastlane/metadata/android -name *.png | grep -v "background"); do
  language="$(cut -d'/' -f5 <<< $i)"
  filename="$(cut -d'/' -f8 <<< $i)"
  short_filename="$(cut -d'_' -f1 <<< $filename)"
  echo $language
  echo $short_filename
  destination="scripts/screenshots/tmp/$language-$short_filename.png"
  echo $destination
  cp $i $destination
  width=`identify -format %w $destination`
  convert $destination -crop "$width"x"$width"+0+0 $destination
done
mv scripts/screenshots/tmp/ ../todorant-frontend/public/img/screenshots/android

# Crop and move screenshots for ios
mkdir scripts/screenshots/tmp
find ios/fastlane/screenshots -name "* *" -type f | rename 's/ /_/g'
for i in $(find ios/fastlane/screenshots -name "*.png" | grep -v "background"); do
  echo $i
  language="$(cut -d'/' -f4 <<< $i)"
  filename="$(cut -d'/' -f5 <<< $i)"
  short_filename="$(cut -d'-' -f2 <<< $filename)"
  echo $language
  echo $short_filename
  destination="scripts/screenshots/tmp/$language-$short_filename.png"
  echo $destination
  cp $i $destination
  width=`identify -format %w $destination`
  convert $destination -crop "$width"x"$width"+0+0 $destination
done
mv scripts/screenshots/tmp/ ../todorant-frontend/public/img/screenshots/ios

# Reset
git reset --hard