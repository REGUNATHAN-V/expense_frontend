import React, { useMemo, useState } from 'react';
import {
  View,
  FlatList,
  Pressable,
  Switch,
  Alert,
  StyleSheet,
} from 'react-native';

import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';

import Screen from '../../components/Screen';
import Card from '../../components/Card';
import Text from '../../components/Text';
import Input from '../../components/Input';
import Avatar from '../../components/Avatar';
import Sheet from '../../components/Sheet';

import {
  Loader,
  EmptyState,
  ErrorState,
  FooterLoader,
} from '../../components/States';

import { useTheme } from '../../theme/theme';

import {
  useGetUsersQuery,
  useUpdateUserRoleMutation,
  useSetUserActiveMutation,
} from '../../api/apiSlice';

import usePagedList from '../../utils/usePagedList';
import { errMsg } from '../../utils/format';
import { ms, fs } from '../../theme/scale';

import MenuButton from '../../navigation/MenuButton';

const ROLE_OPTIONS = [
  {
    value: 1,
    label: 'Maker',
    desc: 'Creates and submits expense claims',
    icon: 'create-outline',
  },
  {
    value: 2,
    label: 'Approver',
    desc: 'Approves, rejects or returns claims',
    icon: 'shield-checkmark-outline',
  },
  {
    value: 3,
    label: 'Admin',
    desc: 'Manages users and sees all reports',
    icon: 'settings-outline',
  },
];

const roleNumber = name =>
  ROLE_OPTIONS.find(role => role.label === name)?.value ?? 1;

function UserCard({
  user,
  currentUser,
  colors,
  styles,
  onChangeRole,
  onToggleActive,
}) {
  const isMe = user.id === currentUser?.id;

  return (
    <Card style={[styles.userCard, { opacity: user.isActive ? 1 : 0.65 }]}>
      <View style={styles.userHeader}>
        <Avatar name={user.name} size={ms(46)} />

        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text variant="h3" numberOfLines={1} style={{ flexShrink: 1 }}>
              {user.name}
            </Text>

            {isMe && (
              <View
                style={[
                  styles.youBadge,
                  {
                    backgroundColor: colors.primarySoft,
                  },
                ]}
              >
                <Text style={[styles.youText, { color: colors.primary }]}>
                  YOU
                </Text>
              </View>
            )}
          </View>

          <Text variant="caption" sub numberOfLines={1}>
            {user.email}
          </Text>
        </View>

        <View style={styles.switchContainer}>
          <Text
            style={[
              styles.activeLabel,
              {
                color: user.isActive ? colors.primary : colors.sub,
              },
            ]}
          >
            {user.isActive ? 'Active' : 'Inactive'}
          </Text>

          <Switch
            value={!!user.isActive}
            onValueChange={value => onToggleActive(user, value)}
            disabled={isMe}
            trackColor={{
              true: colors.switchOn,
              false: colors.switchOff,
            }}
            thumbColor={colors.switchThumb}
          />
        </View>
      </View>

      <View style={[styles.cardDivider, { backgroundColor: colors.border }]} />

      <Pressable
        onPress={() => onChangeRole(user)}
        android_ripple={{
          color: colors.primarySoft,
        }}
        style={[styles.roleButton, { backgroundColor: colors.cardAlt }]}
      >
        <View style={styles.roleLeft}>
          <View
            style={[
              styles.roleIcon,
              {
                backgroundColor: colors.primarySoft,
              },
            ]}
          >
            <Ionicons
              name="shield-outline"
              size={ms(17)}
              color={colors.primary}
            />
          </View>

          <View>
            <Text variant="caption" sub>
              Assigned role
            </Text>

            <Text variant="h3">{user.role}</Text>
          </View>
        </View>

        <View style={styles.changeRole}>
          <Text variant="label" color={colors.primary}>
            Change role
          </Text>

          <Ionicons
            name="chevron-forward"
            size={ms(16)}
            color={colors.primary}
          />
        </View>
      </Pressable>
    </Card>
  );
}

export default function UsersScreen() {
  const { colors } = useTheme();

  const s = useMemo(() => makeStyles(colors), [colors]);

  const me = useSelector(state => state.auth.user);

  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const list = usePagedList(useGetUsersQuery, {});

  const [updateRole, roleState] = useUpdateUserRoleMutation();

  const [setActive] = useSetUserActiveMutation();

  const users = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return list.items;

    return list.items.filter(
      user =>
        (user.name || '').toLowerCase().includes(value) ||
        (user.email || '').toLowerCase().includes(value),
    );
  }, [list.items, search]);

  const activeCount = list.items.filter(user => user.isActive).length;

  const inactiveCount = list.items.length - activeCount;

  const changeRole = async value => {
    if (!selected) return;

    try {
      await updateRole({
        id: selected.id,
        role: value,
      }).unwrap();

      setSelected(null);
      list.refresh();
    } catch (error) {
      Alert.alert("Couldn't change role", errMsg(error));
    }
  };

  const toggleActive = async (user, isActive) => {
    try {
      await setActive({
        id: user.id,
        isActive,
      }).unwrap();

      list.refresh();
    } catch (error) {
      Alert.alert("Couldn't update user", errMsg(error));
    }
  };

  const firstName = (
    me?.name ||
    me?.fullName ||
    me?.firstName ||
    me?.userName ||
    'Admin'
  )
    .trim()
    .split(/\s+/)[0];

  const now = new Date();

  const today = now.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  const greeting =
    now.getHours() < 12
      ? 'GOOD MORNING'
      : now.getHours() < 17
      ? 'GOOD AFTERNOON'
      : 'GOOD EVENING';

  return (
    <Screen padded={false}>
      <View style={s.container}>

        <View style={s.header}>
          <View style={s.decorationOne} />
          <View style={s.decorationTwo} />

          <View style={s.headerTop}>
            <MenuButton />

            <View style={s.greetingContainer}>
              <Text style={s.welcomeText}>{greeting}</Text>

              <Text style={s.greeting}>{firstName}</Text>
            </View>

            <View style={s.dateBadge}>
              <Ionicons name="calendar-outline" size={ms(14)} color="#FFFFFF" />

              <Text style={s.dateText}>{today}</Text>
            </View>
          </View>

          <View style={s.headerDivider} />

          <View style={s.titleRow}>
            <Text style={s.headerTitle}>Users</Text>

            <View style={s.headerIcon}>
              <Ionicons name="people" size={ms(17)} color="#FFFFFF" />
            </View>

            {!list.isLoading && (
              <View style={s.countBadge}>
                <Text style={s.countText}>
                  {list.items.length}
                  {list.hasNext ? '+' : ''}
                </Text>
              </View>
            )}
          </View>

          <Text style={s.headerSubtitle}>
            Manage employees and access roles
          </Text>
        </View>


        <View style={s.summaryContainer}>
          <SummaryCard
            styles={s}
            colors={colors}
            icon="people-outline"
            label="Total"
            value={`${list.items.length}${list.hasNext ? '+' : ''}`}
          />

          <SummaryCard
            styles={s}
            colors={colors}
            icon="checkmark-circle-outline"
            label="Active"
            value={activeCount}
          />

          <SummaryCard
            styles={s}
            colors={colors}
            icon="close-circle-outline"
            label="Inactive"
            value={inactiveCount}
          />
        </View>


        <View style={s.searchContainer}>
          <Input
            icon="search-outline"
            placeholder="Search name or email"
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
            style={s.searchInput}
          />

          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')} style={s.clearSearch}>
              <Ionicons name="close-circle" size={ms(19)} color={colors.sub} />
            </Pressable>
          )}
        </View>


        <View style={s.sectionHeader}>
          <View>
            <Text style={s.sectionTitle}>Team Members</Text>

            <Text style={s.sectionSubtitle}>
              Manage user permissions and status
            </Text>
          </View>

          <View style={s.memberCount}>
            <Ionicons
              name="people-outline"
              size={ms(14)}
              color={colors.primary}
            />

            <Text style={[s.memberCountText, { color: colors.primary }]}>
              {users.length}
            </Text>
          </View>
        </View>


        {list.isLoading ? (
          <Loader />
        ) : list.error && list.items.length === 0 ? (
          <ErrorState message={errMsg(list.error)} onRetry={list.refresh} />
        ) : (
          <FlatList
            data={users}
            keyExtractor={user => String(user.id)}
            contentContainerStyle={s.listContent}
            showsVerticalScrollIndicator={false}
            refreshing={list.refreshing}
            onRefresh={list.pullRefresh}
            onEndReached={list.loadMore}
            onEndReachedThreshold={0.4}
            renderItem={({ item }) => (
              <UserCard
                user={item}
                currentUser={me}
                colors={colors}
                styles={s}
                onChangeRole={setSelected}
                onToggleActive={toggleActive}
              />
            )}
            ListFooterComponent={<FooterLoader show={list.isLoadingMore} />}
            ListEmptyComponent={
              <EmptyState
                icon="people-outline"
                title="No users found"
                message={
                  search
                    ? 'Try another name or email.'
                    : 'No users are available.'
                }
              />
            }
          />
        )}


        <Sheet
          visible={!!selected}
          onClose={() => {
            if (!roleState.isLoading) {
              setSelected(null);
            }
          }}
          title={selected ? `Role for ${selected.name}` : ''}
        >
          <View style={s.sheetHeader}>
            <View style={s.sheetIcon}>
              <Ionicons
                name="shield-checkmark-outline"
                size={ms(22)}
                color={colors.primary}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text variant="h3">Change user role</Text>

              <Text variant="caption" sub>
                Select the appropriate permission
              </Text>
            </View>
          </View>

          {ROLE_OPTIONS.map(role => {
            const active = selected && roleNumber(selected.role) === role.value;

            return (
              <Pressable
                key={role.value}
                disabled={roleState.isLoading}
                onPress={() => changeRole(role.value)}
                style={[
                  s.roleOption,
                  {
                    borderBottomColor: colors.border,
                    backgroundColor: active
                      ? colors.primarySoft
                      : 'transparent',
                  },
                ]}
              >
                <View style={s.roleOptionIcon}>
                  <Ionicons
                    name={role.icon}
                    size={ms(20)}
                    color={colors.primary}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text variant="h3">{role.label}</Text>

                  <Text variant="caption" sub>
                    {role.desc}
                  </Text>
                </View>

                <Ionicons
                  name={active ? 'checkmark-circle' : 'ellipse-outline'}
                  size={ms(22)}
                  color={active ? colors.primary : colors.sub}
                />
              </Pressable>
            );
          })}

          {roleState.isLoading && (
            <View style={s.sheetLoading}>
              <Loader />
            </View>
          )}
        </Sheet>
      </View>
    </Screen>
  );
}

function SummaryCard({ styles, colors, icon, label, value }) {
  return (
    <View style={[styles.summaryCard, { backgroundColor: colors.card }]}>
      <View
        style={[styles.summaryIcon, { backgroundColor: colors.primarySoft }]}
      >
        <Ionicons name={icon} size={ms(18)} color={colors.primary} />
      </View>

      <View style={{ flex: 1 }}>
        <Text variant="caption" sub>
          {label}
        </Text>

        <Text variant="h3">{value}</Text>
      </View>
    </View>
  );
}

const makeStyles = colors =>
  StyleSheet.create({
    container: {
      flex: 1,
    },

    header: {
      backgroundColor: colors.primary,
      paddingHorizontal: ms(17),
      paddingTop: ms(50),
      paddingBottom: ms(23),
      borderBottomLeftRadius: ms(32),
      borderBottomRightRadius: ms(32),
      overflow: 'hidden',
      marginBottom: ms(12),
    },

    decorationOne: {
      position: 'absolute',
      width: ms(190),
      height: ms(190),
      borderRadius: ms(95),
      backgroundColor: 'rgba(255,255,255,0.07)',
      top: -ms(115),
      right: -ms(45),
    },

    decorationTwo: {
      position: 'absolute',
      width: ms(125),
      height: ms(125),
      borderRadius: ms(63),
      backgroundColor: 'rgba(255,255,255,0.06)',
      bottom: -ms(75),
      left: ms(95),
    },

    headerTop: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: ms(10),
    },

    greetingContainer: {
      flex: 1,
      minWidth: 0,
    },

    welcomeText: {
      fontSize: fs(9),
      fontWeight: '800',
      letterSpacing: 1.4,
      color: 'rgba(255,255,255,0.75)',
    },

    greeting: {
      fontSize: fs(18),
      fontWeight: '900',
      color: '#FFFFFF',
      marginTop: ms(3),
    },

    dateBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: ms(5),
      backgroundColor: 'rgba(255,255,255,0.16)',
      paddingHorizontal: ms(9),
      paddingVertical: ms(9),
      borderRadius: ms(12),
      flexShrink: 1,
    },

    dateText: {
      fontSize: fs(9),
      fontWeight: '700',
      color: '#FFFFFF',
    },

    headerDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: 'rgba(255,255,255,0.25)',
      marginVertical: ms(16),
    },

    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: ms(8),
    },

    headerTitle: {
      fontSize: fs(22),
      fontWeight: '900',
      letterSpacing: -0.5,
      color: '#FFFFFF',
    },

    headerIcon: {
      width: ms(30),
      height: ms(30),
      borderRadius: ms(10),
      backgroundColor: 'rgba(255,255,255,0.17)',
      alignItems: 'center',
      justifyContent: 'center',
    },

    countBadge: {
      backgroundColor: 'rgba(255,255,255,0.2)',
      paddingHorizontal: ms(8),
      paddingVertical: ms(3),
      borderRadius: ms(8),
    },

    countText: {
      fontSize: fs(10),
      fontWeight: '800',
      color: '#FFFFFF',
    },

    headerSubtitle: {
      fontSize: fs(10),
      fontWeight: '500',
      color: 'rgba(255,255,255,0.8)',
      marginTop: ms(5),
    },

    summaryContainer: {
      flexDirection: 'row',
      paddingHorizontal: ms(16),
      gap: ms(8),
      marginBottom: ms(12),
    },

    summaryCard: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: ms(7),
      padding: ms(9),
      borderRadius: ms(15),
    },

    summaryIcon: {
      width: ms(32),
      height: ms(32),
      borderRadius: ms(11),
      alignItems: 'center',
      justifyContent: 'center',
    },

    searchContainer: {
      paddingHorizontal: ms(16),
      marginBottom: ms(12),
      justifyContent: 'center',
    },

    searchInput: {
      marginBottom: 0,
    },

    clearSearch: {
      position: 'absolute',
      right: ms(28),
      padding: ms(5),
    },

    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: ms(17),
      marginBottom: ms(10),
    },

    sectionTitle: {
      fontSize: fs(14),
      fontWeight: '900',
      color: colors.text,
    },

    sectionSubtitle: {
      fontSize: fs(10),
      fontWeight: '500',
      color: colors.sub,
      marginTop: ms(3),
    },

    memberCount: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: ms(5),
      backgroundColor: colors.primarySoft,
      paddingHorizontal: ms(10),
      paddingVertical: ms(6),
      borderRadius: ms(10),
    },

    memberCountText: {
      fontSize: fs(11),
      fontWeight: '800',
    },

    listContent: {
      paddingHorizontal: ms(16),
      paddingBottom: ms(24),
      flexGrow: 1,
    },

    userCard: {
      marginBottom: ms(12),
    },

    userHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: ms(10),
    },

    userInfo: {
      flex: 1,
      minWidth: 0,
    },

    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: ms(6),
    },

    youBadge: {
      paddingHorizontal: ms(6),
      paddingVertical: ms(2),
      borderRadius: ms(5),
    },

    youText: {
      fontSize: fs(8),
      fontWeight: '900',
    },

    switchContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },

    activeLabel: {
      fontSize: fs(9),
      fontWeight: '800',
      marginBottom: ms(1),
    },

    cardDivider: {
      height: StyleSheet.hairlineWidth,
      marginVertical: ms(12),
    },

    roleButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: ms(10),
      paddingHorizontal: ms(11),
      borderRadius: ms(12),
    },

    roleLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: ms(9),
    },

    roleIcon: {
      width: ms(34),
      height: ms(34),
      borderRadius: ms(11),
      alignItems: 'center',
      justifyContent: 'center',
    },

    changeRole: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: ms(3),
    },

    sheetHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: ms(12),
      marginBottom: ms(12),
    },

    sheetIcon: {
      width: ms(42),
      height: ms(42),
      borderRadius: ms(14),
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },

    roleOption: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: ms(11),
      paddingVertical: ms(14),
      paddingHorizontal: ms(10),
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderRadius: ms(10),
    },

    roleOptionIcon: {
      width: ms(40),
      height: ms(40),
      borderRadius: ms(12),
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },

    sheetLoading: {
      paddingVertical: ms(10),
    },
  });
