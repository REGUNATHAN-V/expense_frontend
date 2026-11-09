# Expense Claim – React Native CLI (bare) frontend

Roles: **Maker**, **Approver**, **Admin** (tabs and screens change with the signed-in role).
Stack: React Native 0.88 (CLI), React Navigation (native-stack + bottom-tabs), Redux Toolkit + RTK Query.

## Setup
```bash
npm install

# iOS only (macOS)
bundle install                 # first time
cd ios && bundle exec pod install && cd ..
```
Requirements: Node >= 22.11, JDK 17+, Android Studio (SDK + emulator), Xcode for iOS.
See https://reactnative.dev/docs/set-up-your-development-environment

## Run
Start the backend first (`dotnet run` -> http://localhost:5079), then:
```bash
npm start                      # Metro
npm run android                # or: npm run ios
```

## API URL  (src/environment/Environment.js)
- Android emulator: `10.0.2.2:5079` (default)
- iOS simulator: `localhost:5079` (default)
- Real phone on Wi-Fi: set `LAN_IP = "192.168.x.x"` (your PC's IP), allow port 5079 in the firewall
- Real Android phone on USB: `adb reverse tcp:5079 tcp:5079` and set `LAN_IP = "localhost"`

Plain `http` works in debug builds (cleartext is enabled for debug). For release builds use https.

## Native libraries
| Purpose | Package |
|---|---|
| Token storage (Keystore / Keychain) | react-native-keychain |
| Fingerprint / Face ID | react-native-biometrics |
| Icons (Ionicons) | react-native-vector-icons (fonts already wired: `fonts.gradle` + `UIAppFonts`) |
| Theme / settings storage | @react-native-async-storage/async-storage |
| Date picker | @react-native-community/datetimepicker |
| Navigation | react-native-screens, react-native-safe-area-context |

Already configured for you: Android `USE_BIOMETRIC` permission, iOS `NSFaceIDUsageDescription`, icon fonts.

## Screens
| Role | Bottom tabs |
|---|---|
| Maker | Claims · **+** · Totals · Settings (create/edit multi-item claims, draft or submit, cancel, monthly totals) |
| Approver | Approvals · Settings (Approve / Return / Reject) |
| Admin | Reports · Users · Settings. Reports (top segmented bar): Monthly totals incl. employees with no claims, Top 3 categories, Mismatched claims, Latest claim per employee. Users: search, change role, activate/deactivate |

Settings: Light / Dark / System theme, biometric lock (re-locks after 30 s in background), sign out.

## Structure
```
App.js                  bootstrap (restore session, biometric re-lock)
src/api/                baseQuery, baseQueryWithLogging, apiSlice (RTK Query), redux/{authSlice,settingsSlice}
src/store/store.js      store + persistence
src/navigation/         RootNavigator, MainTabs (per role)
src/screens/            auth / maker / approver / admin / common
src/components/         shared UI
src/theme/theme.js      light + dark palettes, useTheme()
```

## Troubleshooting
- Icons show as "?" -> rebuild the app (`npm run android` again / re-run pod install + rebuild iOS); fonts are bundled at build time.
- "Network request failed" -> wrong API URL / backend not running / firewall.
- Android build cache issues -> `cd android && ./gradlew clean`.

## Theme, scaling & navigation (v2 UI)
- `src/theme/palette.js` – HRMS palette (port of `com.vsolvpeople.hrms.ui.theme.Palette`) + `DarkColors` / `LightColors`.
- `src/theme/scale.js` – metric scaling: `s` (horizontal), `vs` (vertical), `ms` (moderate), `fs` (font). Base 375x812, clamped for tablets.
- `src/navigation/AppDrawer.js` – side drawer (menu per role, dark-mode switch, sign out). Open with the menu button or close by swiping left / tapping the scrim / Android back.
- `src/navigation/TabBar.js` – custom bottom bar with active pill and raised "+" button.
- No new native dependencies were added.
