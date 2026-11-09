import React, { useEffect, useRef } from 'react';
import { AppState, StatusBar } from 'react-native';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { store } from './src/store/store';
import { hydrate, lock } from './src/api/redux/authSlice';
import { hydrateSettings } from './src/api/redux/settingsSlice';
import { loadSession, loadSettings } from './src/utils/storage';
import { useTheme } from './src/theme/theme';
import RootNavigator from './src/navigation/RootNavigator';
import environment from './src/environment/Environment';

function Bootstrap() {
  const dispatch = useDispatch();
  const { isDark, colors } = useTheme();
  const biometricEnabled = useSelector(s => s.settings.biometricEnabled);
  const loggedIn = useSelector(s => !!s.auth.token);
  const leftAt = useRef(null);

  // Restore saved settings + session once. Lock immediately if biometrics are on.
  useEffect(() => {
    (async () => {
      const [settings, session] = await Promise.all([
        loadSettings(),
        loadSession(),
      ]);
      if (settings) dispatch(hydrateSettings(settings));
      dispatch(
        hydrate({
          token: session?.token,
          user: session?.user,
          lock: !!settings?.biometricEnabled,
        }),
      );
    })();
  }, [dispatch]);

  // Re-lock when the app has been in the background for a while.
  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state === 'background') {
        leftAt.current = Date.now();
      } else if (state === 'active' && leftAt.current) {
        const away = Date.now() - leftAt.current;
        leftAt.current = null;
        if (biometricEnabled && loggedIn && away > environment.LOCK_AFTER_MS)
          dispatch(lock());
      }
    });
    return () => sub.remove();
  }, [biometricEnabled, loggedIn, dispatch]);

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.bg}
      />
      <RootNavigator />
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
          <Bootstrap />
      </SafeAreaProvider>
    </Provider>
  );
}
