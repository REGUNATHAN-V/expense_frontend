import React, { useMemo, useState } from 'react';
import {
  View,
  FlatList,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useSelector } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';

import Screen from '../../components/Screen';
import Text from '../../components/Text';
import ClaimCard from '../../components/ClaimCard';
import FilterBar from '../../components/FilterBar';


import {
  Loader,
  EmptyState,
  ErrorState,
  FooterLoader,
} from '../../components/States';

import { useTheme } from '../../theme/theme';
import { useGetMyClaimsQuery } from '../../api/apiSlice';
import usePagedList from '../../utils/usePagedList';
import { errMsg, cleanParams } from '../../utils/format';
import { ms, fs } from '../../theme/scale';
import MenuButton from '../../navigation/MenuButton';

const STATUSES = [
  'All',
  'Draft',
  'Submitted',
  'Approved',
  'Rejected',
  'Returned',
  'Cancelled',
];

export default function MyClaimsScreen({ navigation }) {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  const user = useSelector(st => st.auth.user);

  const [status, setStatus] = useState('All');
  const [categoryId, setCategoryId] = useState(null);

  const list = usePagedList(
    useGetMyClaimsQuery,
    cleanParams({ status, categoryId }),
  );

  const count = `${list.items.length}${list.hasNext ? '+' : ''}`;

  const firstName = (
    user?.name ||
    user?.fullName ||
    user?.firstName ||
    user?.userName ||
    'there'
  )
    .trim()
    .split(/\s+/)[0];

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <Screen padded={false}>
      <View style={s.container}>
        <View style={s.header}>
          <View style={s.decorationOne} />
          <View style={s.decorationTwo} />

          <View style={s.headerTop}>
            <MenuButton />

            <View style={s.greetingContainer}>
              <Text style={s.welcomeText}>
                {new Date().getHours() < 12
                  ? 'GOOD MORNING'
                  : new Date().getHours() < 17
                  ? 'GOOD AFTERNOON'
                  : 'GOOD EVENING'}
              </Text>

              <Text style={s.greeting}>{firstName}</Text>
            </View>

            <View style={s.dateBadge}>
              <Ionicons name="calendar-outline" size={ms(14)} color="#FFFFFF" />

              <Text style={s.dateText}>{today}</Text>
            </View>
          </View>

          <View style={s.headerDivider} />

          <View style={s.headerBottom}>
            <View style={s.titleContainer}>
              <View style={s.titleRow}>
                <Text style={s.headerTitle}>My Claims</Text>

                {!list.isLoading && (
                  <View style={s.countBadge}>
                    <Text style={s.countText}>{count}</Text>
                  </View>
                )}
              </View>

              <Text style={s.headerSubtitle}>
                Manage and track your expenses
              </Text>
            </View>

            <Pressable
              onPress={() => navigation.navigate('ClaimForm')}
              hitSlop={8}
              style={({ pressed }) => [
                s.addButton,
                {
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Ionicons name="add" size={ms(20)} color={colors.primary} />

              <Text style={s.addButtonText}>New Claim</Text>
            </Pressable>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={s.chipScroll}
          contentContainerStyle={s.chipContent}
        >
          {STATUSES.map(value => {
            const selected = value === status;

            return (
              <Pressable
                key={value}
                onPress={() => setStatus(value)}
                style={[s.chip, selected && s.chipActive]}
              >

                <Text style={[s.chipText, selected && s.chipTextActive]}>
                  {value}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <FilterBar
          categoryId={categoryId}
          onCategoryChange={setCategoryId}
          style={s.filter}
        />

        {list.isLoading ? (
          <Loader />
        ) : list.error && list.items.length === 0 ? (
          <ErrorState message={errMsg(list.error)} onRetry={list.refresh} />
        ) : (
          <FlatList
            data={list.items}
            keyExtractor={item => String(item.id)}
            renderItem={({ item }) => (
              <ClaimCard
                claim={item}
                onPress={() =>
                  navigation.navigate('ClaimDetail', {
                    id: item.id,
                  })
                }
              />
            )}
            contentContainerStyle={s.listContent}
            showsVerticalScrollIndicator={false}
            onEndReached={list.loadMore}
            onEndReachedThreshold={0.4}
            refreshing={list.refreshing}
            onRefresh={list.pullRefresh}
            ListHeaderComponent={
              list.items.length > 0 ? (
                <View style={s.listHeading}>
                  <Text style={s.listTitle}>Recent Activity</Text>

                </View>
              ) : null
            }
            ListFooterComponent={<FooterLoader show={list.isLoadingMore} />}
            ListEmptyComponent={
              <EmptyState
                icon="receipt-outline"
                title="No claims yet"
                message="Your expense claims will appear here. Create your first claim to get started."
                action="New claim"
                onAction={() => navigation.navigate('ClaimForm')}
              />
            }
          />
        )}
      </View>
    </Screen>
  );
}

const makeStyles = colors =>
  StyleSheet.create({
    container: {
      flex: 1,
    },

    // Curved Header
    header: {
      backgroundColor: colors.primary,
      paddingHorizontal: ms(17),
      paddingTop: ms(50),
      paddingBottom: ms(27),
      borderBottomLeftRadius: ms(32),
      borderBottomRightRadius: ms(32),
      overflow: 'hidden',
      marginBottom: ms(6),
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
      marginVertical: ms(17),
    },

    headerBottom: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: ms(8),
    },

    titleContainer: {
      flex: 1,
      minWidth: 0,
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

    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: ms(3),
      backgroundColor: '#FFFFFF',
      paddingHorizontal: ms(11),
      height: ms(40),
      borderRadius: ms(12),
      flexShrink: 0,
    },

    addButtonText: {
      fontSize: fs(12),
      fontWeight: '800',
      color: colors.primary,
    },

    chipScroll: {
      flexGrow: 0,
      marginBottom: ms(6),
    },

    chipContent: {
      padding: ms(16),
      alignItems: 'center',
    },

    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: ms(4),
      height: ms(34),
      paddingHorizontal: ms(14),
      marginRight: ms(8),
      marginVertical: ms(4),
      borderRadius: 999,
      backgroundColor: colors.card,
      borderWidth: StyleSheet.hairlineWidth * 2,
      borderColor: colors.border,
    },

    chipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },

    chipText: {
      fontSize: fs(12),
      fontWeight: '700',
      color: colors.sub,
    },

    chipTextActive: {
      color: colors.onPrimary,
      fontWeight: '800',
    },

    filter: {
      marginBottom: ms(8),
    },

    // Claims List
    listContent: {
      paddingHorizontal: ms(16),
      paddingTop: ms(4),
      paddingBottom: ms(24),
      flexGrow: 1,
    },

    listHeading: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: ms(5),
      marginBottom: ms(11),
    },

    listTitle: {
      fontSize: fs(14),
      fontWeight: '800',
      color: colors.text,
    },

    listCount: {
      fontSize: fs(11),
      fontWeight: '600',
      color: colors.sub,
    },
  });
