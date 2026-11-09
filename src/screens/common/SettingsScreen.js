import React from 'react';
import { View, Switch, Alert, Pressable } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import Screen from '../../components/Screen';
import Card from '../../components/Card';
import Text from '../../components/Text';
import Button from '../../components/Button';
import Avatar from '../../components/Avatar';
import { useTheme } from '../../theme/theme';
import {
  setThemeMode,
  setBiometricEnabled,
} from '../../api/redux/settingsSlice';
import { logout, ROLES } from '../../api/redux/authSlice';
import { apiSlice } from '../../api/apiSlice';
import { biometricsAvailable, authenticate } from '../../utils/biometrics';
import environment from '../../environment/Environment';
import { fs, ms } from '../../theme/scale';
import { useNavigation } from '@react-navigation/native';

const THEMES = [
  { value: 'system', label: 'System', icon: 'phone-portrait-outline' },
  { value: 'light', label: 'Light', icon: 'sunny-outline' },
  { value: 'dark', label: 'Dark', icon: 'moon-outline' },
];

function Row({ icon, title, subtitle, right, colors }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: ms(12) }}>
      <View
        style={{
          width: ms(38),
          height: ms(38),
          borderRadius: ms(11),
          backgroundColor: colors.primarySoft,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name={icon} size={ms(19)} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="h3">{title}</Text>
        {subtitle ? (
          <Text variant="caption" sub style={{ marginTop: ms(2) }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}

export default function SettingsScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const user = useSelector(s => s.auth.user);
  const { themeMode, biometricEnabled } = useSelector(s => s.settings);

  const toggleBiometric = async on => {
    if (!on) return dispatch(setBiometricEnabled(false));
    if (!(await biometricsAvailable())) {
      return Alert.alert(
        'Biometrics unavailable',
        'Set up a fingerprint or Face ID in your device settings first.',
      );
    }
    if (await authenticate('Confirm to enable biometric lock'))
      dispatch(setBiometricEnabled(true));
  };

  const confirmLogout = () =>
    Alert.alert('Sign out', 'Do you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: () => {
          dispatch(logout());
          dispatch(apiSlice.util.resetApiState()); // drop cached data of this user
        },
      },
    ]);

  return (
    <>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.primary,
          padding: ms(16),
          paddingTop: ms(50),
        }}
      >
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={ms(24)} color="#FFFFFF" />
        </Pressable>
        <Text
          style={{
            color: '#FFFFFF',
            fontSize: fs(18),
            fontWeight: '800',
            marginLeft: ms(14),
          }}
        >
          Settings
        </Text>
      </View>
      <Screen scroll>
        <Card
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: ms(14),
            marginBottom: ms(20),
          }}
        >
          <Avatar name={user?.name} size={ms(56)} />
          <View style={{ flex: 1 }}>
            <Text variant="h2">{user?.name}</Text>
            <Text sub variant="caption">
              {user?.email}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: colors.primarySoft,
              paddingHorizontal: ms(10),
              paddingVertical: ms(4),
              borderRadius: ms(999),
            }}
          >
            <Text
              variant="caption"
              color={colors.primary}
              style={{ fontWeight: '700' }}
            >
              {ROLES[user?.role] ?? 'User'}
            </Text>
          </View>
        </Card>

        <Text
          variant="label"
          sub
          style={{ marginBottom: ms(8), marginLeft: ms(4) }}
        >
          APPEARANCE
        </Text>
        <Card style={{ marginBottom: ms(20) }}>
          <Row
            icon="color-palette-outline"
            title="Theme"
            subtitle="Choose how the app looks"
            colors={colors}
          />
          <View
            style={{ flexDirection: 'row', gap: ms(10), marginTop: ms(14) }}
          >
            {THEMES.map(t => {
              const active = themeMode === t.value;
              return (
                <Pressable
                  key={t.value}
                  onPress={() => dispatch(setThemeMode(t.value))}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    paddingVertical: ms(14),
                    borderRadius: ms(14),
                    gap: ms(6),
                    backgroundColor: active
                      ? colors.primarySoft
                      : colors.cardAlt,
                    borderWidth: 1.5,
                    borderColor: active ? colors.primary : 'transparent',
                  }}
                >
                  <Ionicons
                    name={t.icon}
                    size={ms(22)}
                    color={active ? colors.primary : colors.sub}
                  />
                  <Text
                    variant="label"
                    color={active ? colors.primary : colors.sub}
                  >
                    {t.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        <Text
          variant="label"
          sub
          style={{ marginBottom: ms(8), marginLeft: ms(4) }}
        >
          SECURITY
        </Text>
        <Card style={{ marginBottom: ms(20) }}>
          <Row
            icon="finger-print"
            title="Biometric lock"
            subtitle="Fingerprint / Face ID when opening the app"
            colors={colors}
            right={
              <Switch
                value={biometricEnabled}
                onValueChange={toggleBiometric}
                trackColor={{ true: colors.switchOn, false: colors.switchOff }}
                thumbColor={colors.switchThumb}
              />
            }
          />
        </Card>

        <Text
          variant="label"
          sub
          style={{ marginBottom: ms(8), marginLeft: ms(4) }}
        >
          ABOUT
        </Text>
        <Card style={{ marginBottom: ms(24) }}>
          <Row
            icon="server-outline"
            title="API server"
            subtitle={environment.BASE_URL}
            colors={colors}
          />
        </Card>

        <Button
          title="Sign out"
          icon="log-out-outline"
          variant="danger"
          onPress={confirmLogout}
        />
      </Screen>
    </>
  );
}
