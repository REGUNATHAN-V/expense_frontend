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
import MenuButton from '../../navigation/MenuButton';

import {
  Loader,
  EmptyState,
  ErrorState,
  FooterLoader,
} from '../../components/States';

import { useTheme } from '../../theme/theme';
import { useGetApproverClaimsQuery } from '../../api/apiSlice';
import usePagedList from '../../utils/usePagedList';
import { errMsg, cleanParams } from '../../utils/format';
import { ms, fs } from '../../theme/scale';

const STATUSES = [
  'Pending',
  'Approved',
  'Rejected',
  'Returned',
];

const STATUS_VALUES = {
  Pending: 'Submitted',
  Approved: 'Approved',
  Rejected: 'Rejected',
  Returned: 'Returned',
};

export default function ApprovalsScreen({ navigation }) {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);

  const user = useSelector(st => st.auth.user);

  const [status, setStatus] = useState('Pending');
  const [categoryId, setCategoryId] = useState(null);
  const [employeeId, setEmployeeId] = useState(null);

  const list = usePagedList(
    useGetApproverClaimsQuery,
    cleanParams({
      status: STATUS_VALUES[status],
      categoryId,
      employeeId,
    }),
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

  const greeting =
    new Date().getHours() < 12
      ? 'GOOD MORNING'
      : new Date().getHours() < 17
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
              <Text style={s.welcomeText}>
                {greeting}
              </Text>

              <Text style={s.greeting}>
                {firstName}
              </Text>
            </View>

            <View style={s.dateBadge}>
              <Ionicons
                name="calendar-outline"
                size={ms(14)}
                color="#FFFFFF"
              />

              <Text style={s.dateText}>
                {today}
              </Text>
            </View>
          </View>

          <View style={s.headerDivider} />

          <View style={s.headerBottom}>
            <View style={s.titleContainer}>
              <View style={s.titleRow}>
                <Text style={s.headerTitle}>
                  Approvals
                </Text>

                {!list.isLoading && (
                  <View style={s.countBadge}>
                    <Text style={s.countText}>
                      {count}
                    </Text>
                  </View>
                )}
              </View>

              <Text style={s.headerSubtitle}>
                Review and manage team claims
              </Text>
            </View>

            <View style={s.approvalIcon}>
              <Ionicons
                name="checkmark-done-outline"
                size={ms(25)}
                color="#FFFFFF"
              />
            </View>
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
                style={[
                  s.chip,
                  selected && s.chipActive,
                ]}
              >
                <Text
                  style={[
                    s.chipText,
                    selected && s.chipTextActive,
                  ]}
                >
                  {value}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <FilterBar
          showEmployee
          categoryId={categoryId}
          onCategoryChange={setCategoryId}
          employeeId={employeeId}
          onEmployeeChange={setEmployeeId}
          style={s.filter}
        />

        {list.isLoading ? (
          <Loader />
        ) : list.error && list.items.length === 0 ? (
          <ErrorState
            message={errMsg(list.error)}
            onRetry={list.refresh}
          />
        ) : (
          <FlatList
            data={list.items}
            keyExtractor={item => String(item.id)}
            renderItem={({ item }) => (
              <ClaimCard
                showEmployee
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
                  <View style={s.headingLeft}>
                    <View style={s.headingIcon}>
                      <Ionicons
                        name="documents-outline"
                        size={ms(16)}
                        color={colors.primary}
                      />
                    </View>

                    <Text style={s.listTitle}>
                      Recent Approvals
                    </Text>
                  </View>
                </View>
              ) : null
            }
            ListFooterComponent={
              <FooterLoader show={list.isLoadingMore} />
            }
            ListEmptyComponent={
              <EmptyState
                icon="checkmark-done-outline"
                title={
                  status === 'Pending'
                    ? 'All caught up'
                    : 'Nothing here'
                }
                message={
                  status === 'Pending'
                    ? 'No claims are waiting for your approval.'
                    : `No ${status.toLowerCase()} claims found.`
                }
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

    header: {
      backgroundColor: colors.primary,
      paddingHorizontal: ms(17),
      paddingTop: ms(50),
      paddingBottom: ms(25),
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
      marginVertical: ms(16),
    },

    headerBottom: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: ms(10),
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

    approvalIcon: {
      width: ms(43),
      height: ms(43),
      borderRadius: ms(14),
      backgroundColor: 'rgba(255,255,255,0.16)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)',
    },

    chipScroll: {
      flexGrow: 0,
      marginBottom: ms(6),
    },

    chipContent: {
      paddingHorizontal: ms(16),
      paddingVertical: ms(10),
      alignItems: 'center',
    },

    chip: {
      alignItems: 'center',
      justifyContent: 'center',
      height: ms(34),
      paddingHorizontal: ms(14),
      marginRight: ms(8),
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

    listContent: {
      paddingHorizontal: ms(16),
      paddingTop: ms(4),
      paddingBottom: ms(24),
      flexGrow: 1,
    },

    listHeading: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: ms(5),
      marginBottom: ms(11),
    },

    headingLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: ms(8),
    },

    headingIcon: {
      width: ms(29),
      height: ms(29),
      borderRadius: ms(9),
      backgroundColor: colors.primary + '15',
      alignItems: 'center',
      justifyContent: 'center',
    },

    listTitle: {
      fontSize: fs(14),
      fontWeight: '800',
      color: colors.text,
    },
  });