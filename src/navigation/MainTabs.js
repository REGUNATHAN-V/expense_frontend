import React from 'react';
import { View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { useTheme } from '../theme/theme';
import HeaderThemeToggle from './HeaderThemeToggle';
import MenuButton from './MenuButton';
import TabBar from './TabBar';
import AppDrawer from './AppDrawer';
import { DrawerProvider, useDrawer } from './DrawerContext';
import { ms, fs } from '../theme/scale';
import SettingsScreen from '../screens/common/SettingsScreen';
import MyClaimsScreen from '../screens/maker/MyClaimsScreen';
import MyTotalsScreen from '../screens/maker/MyTotalsScreen';
import ApprovalsScreen from '../screens/approver/ApprovalsScreen';
import ReportsScreen from '../screens/admin/ReportsScreen';
import UsersScreen from '../screens/admin/UsersScreen';

const Tab = createBottomTabNavigator();
const Placeholder = () => null;

const icon =
  (name, nameActive) =>
  ({ color, size, focused }) =>
    <Ionicons name={focused ? nameActive : name} size={size} color={color} />;

function useTabOptions() {
  return {
    headerShown: false,
  };
}

const useFocusSync = () => {
  const { setActive } = useDrawer();
  return ({ route }) => ({ focus: () => setActive(route.name) });
};

function MakerTabs() {
  const options = useTabOptions();
  const sync = useFocusSync();
  return (
    <Tab.Navigator
      screenOptions={options}
      tabBar={p => <TabBar {...p} />}
      screenListeners={sync}
    >
      <Tab.Screen
        name="Claims"
        component={MyClaimsScreen}
        options={{
          title: 'My Claims',
          tabBarLabel: 'Claims',
          tabBarIcon: icon('receipt-outline', 'receipt'),
        }}
      />
      <Tab.Screen
        name="New"
        component={Placeholder}
        options={{
          tabBarLabel: '',
          tabBarIcon: () => null,
        }}
        listeners={({ navigation }) => ({
          tabPress: e => {
            e.preventDefault();
            navigation.getParent()?.navigate('ClaimForm');
          },
        })}
      />
      <Tab.Screen
        name="Totals"
        component={MyTotalsScreen}
        options={{
          title: 'Monthly Totals',
          tabBarIcon: icon('stats-chart-outline', 'stats-chart'),
        }}
      />
    </Tab.Navigator>
  );
}

function ApproverTabs() {
  const options = useTabOptions();
  const sync = useFocusSync();
  return (
    <Tab.Navigator
      screenOptions={options}
      tabBar={p => <TabBar {...p} />}
      screenListeners={sync}
    >
      <Tab.Screen
        name="Approvals"
        component={ApprovalsScreen}
        options={{
          tabBarIcon: icon('checkmark-done-outline', 'checkmark-done'),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ tabBarIcon: icon('settings-outline', 'settings') }}
      />
    </Tab.Navigator>
  );
}

function AdminTabs() {
  const options = useTabOptions();
  const sync = useFocusSync();
  return (
    <Tab.Navigator
      screenOptions={options}
      tabBar={p => <TabBar {...p} />}
      screenListeners={sync}
    >
      <Tab.Screen
        name="Reports"
        component={ReportsScreen}
        options={{ tabBarIcon: icon('bar-chart-outline', 'bar-chart') }}
      />
      <Tab.Screen
        name="Users"
        component={UsersScreen}
        options={{ tabBarIcon: icon('people-outline', 'people') }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ tabBarIcon: icon('settings-outline', 'settings') }}
      />
    </Tab.Navigator>
  );
}

export default function MainTabs() {
  const role = useSelector(s => s.auth.user?.role);
  const Tabs = role === 3 ? AdminTabs : role === 2 ? ApproverTabs : MakerTabs;
  return (
    <DrawerProvider>
      <View style={{ flex: 1 }}>
        <Tabs />
        <AppDrawer />
      </View>
    </DrawerProvider>
  );
}
