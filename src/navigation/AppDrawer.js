import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  Animated,
  BackHandler,
  Easing,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
  useWindowDimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Text from '../components/Text';
import Avatar from '../components/Avatar';
import { useTheme } from '../theme/theme';
import { ms, s, fs } from '../theme/scale';
import { setThemeMode } from '../api/redux/settingsSlice';
import { logout, ROLES } from '../api/redux/authSlice';
import { apiSlice } from '../api/apiSlice';
import { useDrawer } from './DrawerContext';
import { goToTab, goTo } from './navigationRef';

export const MENU = {
  1: [
    { label: 'My Claims', icon: 'receipt-outline', tab: 'Claims' },
    { label: 'Monthly Totals', icon: 'stats-chart-outline', tab: 'Totals' },
    { label: 'New Claim', icon: 'add-circle-outline', stack: 'ClaimForm' },
    { label: 'Settings', icon: 'settings-outline', stack: 'Settings' },
  ],
  2: [
    { label: 'Approvals', icon: 'checkmark-done-outline', tab: 'Approvals' },
    { label: 'Settings', icon: 'settings-outline', tab: 'Settings' },
  ],
  3: [
    { label: 'Reports', icon: 'bar-chart-outline', tab: 'Reports' },
    { label: 'Users', icon: 'people-outline', tab: 'Users' },
    { label: 'Settings', icon: 'settings-outline', tab: 'Settings' },
  ],
};

function DrawerItem({ item, active, onPress, colors }) {
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: colors.primarySoft }}
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      style={({ pressed }) => [
        styles.menuItem,
        {
          backgroundColor: active
            ? colors.primarySoft
            : pressed
            ? colors.cardAlt
            : 'transparent',
        },
      ]}
    >
      <View
        style={[
          styles.menuIcon,
          {
            backgroundColor: active ? colors.primary : colors.cardAlt,
          },
        ]}
      >
        <Ionicons
          name={item.icon}
          size={ms(20)}
          color={active ? colors.onPrimary : colors.sub}
        />
      </View>

      <Text
        variant="h3"
        color={active ? colors.primary : colors.text}
        style={styles.menuLabel}
      >
        {item.label}
      </Text>

      {active ? (
        <View
          style={[styles.activeIndicator, { backgroundColor: colors.primary }]}
        />
      ) : (
        <Ionicons
          name="chevron-forward"
          size={ms(15)}
          color={colors.sub}
          style={{ opacity: 0.45 }}
        />
      )}
    </Pressable>
  );
}

export default function AppDrawer() {
  const { colors, isDark } = useTheme();
  const { isOpen, close, active } = useDrawer();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const dispatch = useDispatch();
  const user = useSelector(st => st.auth.user);

  const panelW = Math.min(s(320), width * 0.86);

  const progress = useRef(new Animated.Value(0)).current;
  const [mounted, setMounted] = useState(false);

  const menuItems = MENU[user?.role] ?? MENU[1];

  const stylesByTheme = useMemo(() => makeStyles(colors), [colors]);

  const animate = useCallback(
    (to, done) => {
      Animated.timing(progress, {
        toValue: to,
        duration: to ? 280 : 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(done);
    },
    [progress],
  );

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      animate(1);
    } else if (mounted) {
      animate(0, ({ finished }) => {
        if (finished) setMounted(false);
      });
    }
  }, [isOpen, mounted, animate]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      close();
      return true;
    });

    return () => sub.remove();
  }, [isOpen, close]);

  const pan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          gesture.dx < -8 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.5,

        onPanResponderMove: (_, gesture) => {
          progress.setValue(Math.max(0, Math.min(1, 1 + gesture.dx / panelW)));
        },

        onPanResponderRelease: (_, gesture) => {
          if (gesture.dx < -panelW * 0.3 || gesture.vx < -0.6) {
            close();
          } else {
            animate(1);
          }
        },

        onPanResponderTerminate: () => animate(1),
      }),
    [panelW, close, animate, progress],
  );

  if (!mounted) return null;

  const navigate = item => {
    close();

    setTimeout(() => {
      if (item.tab) {
        goToTab(item.tab);
      } else if (item.stack) {
        goTo(item.stack);
      }
    }, 60);
  };

  const confirmLogout = () => {
    close();

    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: () => {
          dispatch(logout());
          dispatch(apiSlice.util.resetApiState());
        },
      },
    ]);
  };

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-panelW, 0],
  });

  const firstName = user?.name?.trim()?.split(/\s+/)[0] || 'User';

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: colors.overlay,
            opacity: progress,
          },
        ]}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={close}
          accessibilityLabel="Close navigation menu"
        />
      </Animated.View>

      <Animated.View
        {...pan.panHandlers}
        style={[
          stylesByTheme.drawer,
          {
            width: panelW,
            transform: [{ translateX }],
          },
        ]}
      >
        <View
          style={[
            stylesByTheme.header,
            {
              paddingTop: insets.top + ms(18),
            },
          ]}
        >
          <View style={[stylesByTheme.blob, stylesByTheme.blobOne]} />

          <View style={[stylesByTheme.blob, stylesByTheme.blobTwo]} />

          <View style={styles.profileTop}>
            <View style={styles.avatarWrapper}>
              <Avatar name={user?.name} size={ms(58)} />
              <View
                style={[
                  styles.onlineIndicator,
                  {
                    borderColor: colors.topBar,
                  },
                ]}
              />
            </View>

            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <View style={styles.roleBadge}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={ms(13)}
                  color="#FFFFFF"
                />
                <Text variant="caption" color="#FFFFFF" style={styles.roleText}>
                  {ROLES[user?.role] ?? 'User'}
                </Text>
              </View>
            </View>
          </View>

          <Text
            variant="h2"
            color="#FFFFFF"
            numberOfLines={1}
            style={styles.profileName}
          >
            Hello, {firstName}!
          </Text>

          <Text
            variant="caption"
            color="#FFFFFFCC"
            numberOfLines={1}
            style={styles.profileEmail}
          >
            {user?.email || ''}
          </Text>

          <View style={styles.profileBottom}>
            <View style={styles.profileInfo}>
              <Ionicons
                name="person-circle-outline"
                size={ms(15)}
                color="#FFFFFFCC"
              />
              <Text
                variant="caption"
                color="#FFFFFF"
                style={styles.profileInfoText}
              >
                Expense Claim Account
              </Text>
            </View>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.sectionHeader}>
            <Text variant="caption" sub style={styles.sectionTitle}>
              WORKSPACE
            </Text>
            <View
              style={[styles.sectionLine, { backgroundColor: colors.divider }]}
            />
          </View>

          {menuItems.map(item => (
            <DrawerItem
              key={item.label}
              item={item}
              colors={colors}
              active={!!item.tab && item.tab === active}
              onPress={() => navigate(item)}
            />
          ))}

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          <View style={styles.sectionHeader}>
            <Text variant="caption" sub style={styles.sectionTitle}>
              PREFERENCES
            </Text>
            <View
              style={[styles.sectionLine, { backgroundColor: colors.divider }]}
            />
          </View>

          <View style={stylesByTheme.preferenceRow}>
            <View style={styles.menuIcon}>
              <Ionicons
                name={isDark ? 'moon' : 'sunny'}
                size={ms(20)}
                color={colors.primary}
              />
            </View>

            <View style={styles.preferenceText}>
              <Text variant="h3" color={colors.text}>
                Dark mode
              </Text>
              <Text variant="caption" color={colors.sub}>
                Change app appearance
              </Text>
            </View>

            <Switch
              value={isDark}
              onValueChange={value =>
                dispatch(setThemeMode(value ? 'dark' : 'light'))
              }
              trackColor={{
                true: colors.switchOn,
                false: colors.switchOff,
              }}
              thumbColor={colors.switchThumb}
            />
          </View>
        </ScrollView>

        <View
          style={[
            stylesByTheme.footer,
            {
              paddingBottom: insets.bottom + ms(12),
            },
          ]}
        >
          <Pressable
            onPress={confirmLogout}
            android_ripple={{
              color: colors.dangerText,
            }}
            accessibilityRole="button"
            style={({ pressed }) => [
              stylesByTheme.logoutButton,
              {
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <View
              style={[
                styles.logoutIcon,
                {
                  backgroundColor: colors.dangerText + '12',
                },
              ]}
            >
              <Ionicons
                name="log-out-outline"
                size={ms(21)}
                color={colors.dangerText}
              />
            </View>

            <Text
              variant="label"
              color={colors.dangerText}
              style={styles.logoutText}
            >
              Sign out
            </Text>

            <View style={{ flex: 1 }} />

            <Ionicons
              name="chevron-forward"
              size={ms(17)}
              color={colors.dangerText}
            />
          </Pressable>

          <Text variant="caption" sub style={styles.version}>
            Expense Claim · v0.0.1
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(13),
    minHeight: ms(58),
    paddingHorizontal: ms(12),
    paddingVertical: ms(8),
    borderRadius: ms(14),
    marginBottom: ms(5),
    overflow: 'hidden',
  },

  menuIcon: {
    width: ms(40),
    height: ms(40),
    borderRadius: ms(13),
    alignItems: 'center',
    justifyContent: 'center',
  },

  menuLabel: {
    flex: 1,
    fontSize: fs(14),
    fontWeight: '700',
  },

  activeIndicator: {
    width: ms(6),
    height: ms(6),
    borderRadius: ms(3),
  },

  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatarWrapper: {
    position: 'relative',
  },

  onlineIndicator: {
    position: 'absolute',
    right: 1,
    bottom: 2,
    width: ms(13),
    height: ms(13),
    borderRadius: ms(7),
    backgroundColor: '#34D399',
    borderWidth: 2,
  },

  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(5),
    backgroundColor: '#FFFFFF24',
    paddingHorizontal: ms(10),
    paddingVertical: ms(7),
    borderRadius: ms(20),
  },

  roleText: {
    fontWeight: '800',
    fontSize: fs(11),
  },

  profileName: {
    marginTop: ms(15),
    fontSize: fs(21),
    fontWeight: '800',
    letterSpacing: -0.4,
  },

  profileEmail: {
    marginTop: ms(4),
    fontSize: fs(12),
  },

  profileBottom: {
    marginTop: ms(16),
    flexDirection: 'row',
    alignItems: 'center',
  },

  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(6),
  },

  profileInfoText: {
    fontSize: fs(11),
    fontWeight: '600',
  },

  blob: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    opacity: 0.08,
  },

  blobOne: {
    width: ms(150),
    height: ms(150),
    right: -ms(65),
    top: -ms(55),
  },

  blobTwo: {
    width: ms(100),
    height: ms(100),
    right: ms(55),
    bottom: -ms(60),
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(12),
    marginBottom: ms(12),
    paddingHorizontal: ms(5),
  },

  sectionTitle: {
    fontSize: fs(10),
    fontWeight: '800',
    letterSpacing: 1.2,
  },

  sectionLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },

  divider: {
    height: StyleSheet.hairlineWidth * 2,
    marginVertical: ms(20),
  },

  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(12),
    paddingHorizontal: ms(10),
    paddingVertical: ms(8),
    borderRadius: ms(14),
  },

  preferenceText: {
    flex: 1,
    gap: ms(3),
  },

  logoutIcon: {
    width: ms(38),
    height: ms(38),
    borderRadius: ms(12),
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoutText: {
    fontSize: fs(14),
    fontWeight: '800',
  },

  version: {
    textAlign: 'center',
    marginTop: ms(13),
    fontSize: fs(10),
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: ms(14),
    paddingTop: ms(20),
    paddingBottom: ms(16),
  },
});

const makeStyles = colors =>
  StyleSheet.create({
    drawer: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      backgroundColor: colors.card,
      borderTopRightRadius: ms(26),
      borderBottomRightRadius: ms(26),
      overflow: 'hidden',
      borderRightWidth: StyleSheet.hairlineWidth * 2,
      borderColor: colors.border,
      elevation: 16,
      shadowColor: colors.shadow,
      shadowOpacity: 0.3,
      shadowRadius: 20,
      shadowOffset: {
        width: 6,
        height: 0,
      },
    },

    header: {
      backgroundColor: colors.topBar,
      paddingHorizontal: ms(20),
      paddingBottom: ms(20),
      overflow: 'hidden',
    },

    footer: {
      paddingHorizontal: ms(14),
      paddingTop: ms(12),
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.divider,
      backgroundColor: colors.card,
    },

    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: ms(12),
      paddingHorizontal: ms(10),
      paddingVertical: ms(9),
      borderRadius: ms(14),
      backgroundColor: colors.dangerBg,
      overflow: 'hidden',
    },

    preferenceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      minHeight: ms(64),
      paddingHorizontal: ms(10),
      paddingVertical: ms(8),
      borderRadius: ms(14),
      gap: ms(12),
      backgroundColor: colors.cardAlt,
    },

    preferenceText: {
      flex: 1,
      minWidth: 0,
      justifyContent: 'center',
      gap: ms(3),
    },
  });
