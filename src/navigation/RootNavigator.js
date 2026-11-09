import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { useTheme } from '../theme/theme';
import { Loader } from '../components/States';
import HeaderThemeToggle from './HeaderThemeToggle';
import { navigationRef } from './navigationRef';
import { fs } from '../theme/scale';
import MainTabs from './MainTabs';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import LockScreen from '../screens/auth/LockScreen';
import ClaimDetailScreen from '../screens/common/ClaimDetailScreen';
import CategoryItemsScreen from '../screens/common/CategoryItemsScreen';
import ClaimFormScreen from '../screens/maker/ClaimFormScreen';
import SettingsScreen from '../screens/common/SettingsScreen';
import ClaimReviewScreen from '../screens/maker/ClaimReviewScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { colors, isDark } = useTheme();
  const { token, hydrated, locked } = useSelector(s => s.auth);

  const base = isDark ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.primary,
      background: colors.bg,
      card: colors.topBar,
      text: colors.text,
      border: colors.border,
    },
  };

  const header = {
    headerStyle: { backgroundColor: colors.topBar },
    headerTintColor: colors.topBarContent,
    headerShadowVisible: false,
    headerTitleStyle: {
      fontWeight: '800',
      fontSize: fs(18),
      color: colors.topBarContent,
    },
    statusBarStyle: 'light',
    contentStyle: { backgroundColor: colors.bg },
  };

  const authHeader = {
    ...header,
    headerStyle: { backgroundColor: colors.bg },
    headerTintColor: colors.text,
    headerTitleStyle: {
      fontWeight: '800',
      fontSize: fs(18),
      color: colors.text,
    },
    statusBarStyle: isDark ? 'light' : 'dark',
  };

  if (!hydrated) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <Loader />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <NavigationContainer ref={navigationRef} theme={navTheme}>
        {token ? (
          <Stack.Navigator screenOptions={header}>
            <Stack.Screen
              name="Main"
              component={MainTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ClaimDetail"
              component={ClaimDetailScreen}
              options={{
                title: 'Claim details'
              }}
            />
            <Stack.Screen
              name="CategoryItems"
              component={CategoryItemsScreen}
              options={({ route }) => ({
                title: route.params?.category ?? 'Expenses',
              })}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ClaimForm"
              component={ClaimFormScreen}
              options={({ route }) => ({
                title: route.params?.claim ? 'Edit claim' : 'New claim',
                presentation: 'modal',
              })}
            />
            <Stack.Screen
              name="ClaimReview"
              component={ClaimReviewScreen}
              options={{ headerShown: true }}
            />
          </Stack.Navigator>
        ) : (
          <Stack.Navigator screenOptions={authHeader}>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        )}
      </NavigationContainer>

      {token && locked ? (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.bg }]}>
          <LockScreen />
        </View>
      ) : null}
    </View>
  );
}
