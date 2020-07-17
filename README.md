# todorant-rn

## Project setup

```
nvm install 10
```

```
yarn install
```

## Android Device

Connect your device and give it all required permissions

### Compiles and hot-reloads for development

```
npx react-native start run-android
```

### If you got an error that it can't downlod script

Run 2 terminals in parallel

Enter this in first one

```
npx react-native start
```

And this in second

```
npx react-native run-android
```

### Login

Run your local frontend and backend

Open up your frontend, then open up QR code

Scan it with your phone

### If you're getting a Network Error try this

```
yarn adb
```

Try again

## Android Emulator

If you're using an android emulator, you need to specify your SDK location at local.properties. Look at 'android/local.properties.example'.