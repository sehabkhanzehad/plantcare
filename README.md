# PlantCare

Expo (SDK 57) React Native app with Expo Router. Routes live under `src/app/`.

## Local development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the dev server:

   ```bash
   npx expo start
   ```

3. Quality checks:

   ```bash
   npx expo lint
   npx tsc --noEmit
   npx expo-doctor
   ```

## EAS Build (Android & iOS)

This project is linked to EAS (`app.json` → `extra.eas.projectId`). Builds run in the cloud; you do not need Android Studio or Xcode on your machine for EAS builds.

### One-time setup

1. Create an [Expo account](https://expo.dev/signup) if you do not have one.

2. Log in:

   ```bash
   npx eas-cli@latest login
   ```

3. Confirm the project (already configured if `eas.json` exists):

   ```bash
   npx eas-cli@latest whoami
   ```

**Apple (iOS):** Device builds need an [Apple Developer Program](https://developer.apple.com/programs/) membership. The first iOS build will prompt you to set up credentials (let EAS manage them unless you have a specific setup).

**Android:** The first build will prompt for a keystore; choose **Let Expo generate a keystore** for testing.

Before store release, change `com.anonymous.plantcare` in `app.json` (`ios.bundleIdentifier` and `android.package`) to your own identifier.

### Build profiles

| Profile       | Use case                         | Android output | iOS output      |
|---------------|----------------------------------|----------------|-----------------|
| `preview`     | Test APK / internal install      | `.apk`         | Device `.ipa`   |
| `production`  | Play Store / App Store           | `.aab`         | Store `.ipa`    |
| `development` | Dev client with native debugging | varies         | dev client      |

### Commands to run

**Preview — Android only (APK):**

```bash
npx eas-cli@latest build --platform android --profile preview
```

**Preview — iOS only (install on registered devices):**

```bash
npx eas-cli@latest build --platform ios --profile preview
```

**Preview — both platforms in one command:**

```bash
npx eas-cli@latest build --platform all --profile preview
```

**Production — both platforms (store-ready):**

```bash
npx eas-cli@latest build --platform all --profile production
```

**List recent builds and download links:**

```bash
npx eas-cli@latest build:list
```

When a build finishes, open the build URL from the terminal or go to [expo.dev](https://expo.dev) → your project → **Builds** → **Download**.

### Install preview builds

- **Android:** Copy the `.apk` to the phone and install (allow install from unknown sources if prompted).
- **iOS:** Use the install link from EAS (internal distribution) or register device UDIDs for ad hoc builds per [Expo internal distribution](https://docs.expo.dev/build/internal-distribution/).

### Submit to stores (after production build)

```bash
npx eas-cli@latest submit --platform android --profile production
npx eas-cli@latest submit --platform ios --profile production
```

Configure store credentials when prompted. See [EAS Submit](https://docs.expo.dev/submit/introduction/).

## Learn more

- [Expo documentation](https://docs.expo.dev/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
