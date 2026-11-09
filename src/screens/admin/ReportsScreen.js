import React, { useMemo, useState } from 'react';

import {
  View,
  FlatList,
  SectionList,
  ScrollView,
  RefreshControl,
  Pressable,
  StyleSheet,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';

import Screen from '../../components/Screen';
import Card from '../../components/Card';
import Text from '../../components/Text';
import Segmented from '../../components/Segmented';
import StatusBadge from '../../components/StatusBadge';
import Avatar from '../../components/Avatar';
import { ChipRow } from '../../components/Chip';
import FilterBar from '../../components/FilterBar';

import {
  Loader,
  EmptyState,
  ErrorState,
  FooterLoader,
} from '../../components/States';

import { useTheme } from '../../theme/theme';

import {
  useGetMonthlyTotalsQuery,
  useGetTopCategoriesQuery,
  useGetMismatchedClaimsQuery,
  useGetLatestClaimsQuery,
} from '../../api/apiSlice';

import usePagedList from '../../utils/usePagedList';

import {
  money,
  fmtMonth,
  fmtDate,
  errMsg,
  cleanParams,
} from '../../utils/format';

import { ms, fs } from '../../theme/scale';
import MenuButton from '../../navigation/MenuButton';

const TABS = [
  { label: 'Monthly', value: 'monthly' },
  { label: 'Top 3', value: 'top' },
  { label: 'Mismatch', value: 'mismatch' },
  { label: 'Latest', value: 'latest' },
];

const STATUSES = [
  'All',
  'Draft',
  'Submitted',
  'Approved',
  'Rejected',
  'Returned',
  'Cancelled',
].map(s => ({
  label: s,
  value: s,
}));

const DAYS = [30, 90, 180, 365].map(d => ({
  label: `${d} days`,
  value: d,
}));

const filterParams = ({ status, categoryId, employeeId }) =>
  cleanParams({
    status,
    categoryId,
    employeeId,
  });
function ListShell({ list, children }) {
  if (list.isLoading) {
    return <Loader />;
  }

  if (list.error && list.items.length === 0) {
    return <ErrorState message={errMsg(list.error)} onRetry={list.refresh} />;
  }

  return children;
}

function MonthlyTotals({ filters }) {
  const { colors } = useTheme();
  const navigation = useNavigation();

  const list = usePagedList(
    useGetMonthlyTotalsQuery,
    filterParams(filters),
    50,
  );

  const sections = useMemo(() => {
    const map = new Map();

    list.items.forEach(item => {
      if (!map.has(item.employeeId)) {
        map.set(item.employeeId, {
          employeeId: item.employeeId,
          name: item.employeeName,
          data: [],
        });
      }

      map.get(item.employeeId).data.push(item);
    });

    return [...map.values()].map(section => ({
      ...section,
      total: section.data.reduce(
        (sum, item) => sum + (item.month ? item.total : 0),
        0,
      ),
    }));
  }, [list.items]);

  return (
    <ListShell list={list}>
      <SectionList
        sections={sections}
        keyExtractor={(item, index) =>
          `${item.employeeId}-${item.month}-${item.categoryId}-${index}`
        }
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshing={list.refreshing}
        onRefresh={list.pullRefresh}
        onEndReached={list.loadMore}
        onEndReachedThreshold={0.4}
        renderSectionHeader={({ section }) => (
          <View style={[styles.employeeHeader, { backgroundColor: colors.bg }]}>
            <Avatar name={section.name} size={ms(36)} />

            <Text variant="h3" style={{ flex: 1 }} numberOfLines={1}>
              {section.name}
            </Text>

            <Text variant="label" color={colors.primary}>
              {money(section.total)}
            </Text>
          </View>
        )}
        renderItem={({ item, index, section }) => {
          const first = index === 0;
          const last = index === section.data.length - 1;

          const open = () => {
            navigation.navigate('CategoryItems', {
              employeeId: item.employeeId,
              employeeName: item.employeeName,
              month: item.month,
              categoryId: item.categoryId,
              category: item.category,
              total: item.total,
              status: filters.status === 'All' ? undefined : filters.status,
            });
          };

          return (
            <Pressable
              disabled={!item.month}
              onPress={open}
              android_ripple={{
                color: colors.primarySoft,
              }}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: ms(12),
                paddingHorizontal: ms(15),
                backgroundColor: colors.card,

                borderTopLeftRadius: first ? ms(14) : 0,
                borderTopRightRadius: first ? ms(14) : 0,
                borderBottomLeftRadius: last ? ms(14) : 0,
                borderBottomRightRadius: last ? ms(14) : 0,

                borderBottomWidth: last ? 0 : 1,
                borderBottomColor: colors.border,
              }}
            >
              {item.month ? (
                <>
                  <View style={{ flex: 1 }}>
                    <Text variant="h3">{item.category}</Text>

                    <Text variant="caption" sub>
                      {fmtMonth(item.month)}
                    </Text>
                  </View>

                  <View style={styles.amountRow}>
                    <Text variant="h3">{money(item.total)}</Text>

                    <Ionicons
                      name="chevron-forward"
                      size={ms(16)}
                      color={colors.sub}
                    />
                  </View>
                </>
              ) : (
                <Text sub style={{ fontStyle: 'italic' }}>
                  No claims yet
                </Text>
              )}
            </Pressable>
          );
        }}
        ListFooterComponent={<FooterLoader show={list.isLoadingMore} />}
        ListEmptyComponent={
          <EmptyState
            icon="people-outline"
            title="No data"
            message="No employees found."
          />
        }
      />
    </ListShell>
  );
}

function TopCategories({ days, employeeId }) {
  const { colors } = useTheme();

  const q = useGetTopCategoriesQuery(
    cleanParams({
      days,
      limit: 3,
      employeeId,
    }),
  );

  const rows = q.data ?? [];

  const max = Math.max(...rows.map(item => item.total), 1);

  const medals = ['#F5B301', '#A0A7B4', '#C57A44'];

  if (q.isLoading) {
    return <Loader />;
  }

  if (q.error) {
    return <ErrorState message={errMsg(q.error)} onRetry={q.refetch} />;
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
      refreshControl={
        <RefreshControl
          refreshing={q.isFetching}
          onRefresh={q.refetch}
          tintColor={colors.primary}
        />
      }
    >
      {rows.length === 0 ? (
        <EmptyState
          icon="pie-chart-outline"
          title="No spending"
          message={`No claims in the last ${days} days.`}
        />
      ) : (
        rows.map((item, index) => (
          <Card key={item.categoryId} style={styles.categoryCard}>
            <View style={styles.categoryRow}>
              <View
                style={[
                  styles.medal,
                  {
                    backgroundColor: medals[index] + '25',
                  },
                ]}
              >
                <Ionicons name="trophy" size={ms(20)} color={medals[index]} />
              </View>

              <View style={{ flex: 1 }}>
                <Text variant="h3">{item.category}</Text>

                <Text variant="caption" sub>
                  #{index + 1} category
                </Text>
              </View>

              <Text variant="amount">{money(item.total)}</Text>
            </View>

            <View
              style={[
                styles.progressTrack,
                {
                  backgroundColor: colors.mutedSoft,
                },
              ]}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${(item.total / max) * 100}%`,
                    backgroundColor: colors.primary,
                  },
                ]}
              />
            </View>
          </Card>
        ))
      )}
    </ScrollView>
  );
}

function Mismatched({ filters }) {
  const { colors } = useTheme();
  const navigation = useNavigation();

  const list = usePagedList(useGetMismatchedClaimsQuery, filterParams(filters));

  return (
    <ListShell list={list}>
      <FlatList
        data={list.items}
        keyExtractor={item => String(item.claimId)}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={list.refreshing}
        onRefresh={list.pullRefresh}
        onEndReached={list.loadMore}
        onEndReachedThreshold={0.4}
        renderItem={({ item }) => (
          <Card
            onPress={() =>
              navigation.navigate('ClaimDetail', {
                id: item.claimId,
                employeeName: item.employeeName,
              })
            }
            style={styles.claimCard}
          >
            <View style={styles.claimHeader}>
              <View style={styles.employeeInfo}>
                <Avatar name={item.employeeName} size={ms(38)} />

                <View style={{ flex: 1 }}>
                  <Text variant="h3" numberOfLines={1}>
                    {item.employeeName || `Employee #${item.employeeId}`}
                  </Text>

                  <Text variant="caption" sub>
                    Claim #{item.claimId} · {fmtDate(item.claimDate)}
                  </Text>
                </View>
              </View>

              <StatusBadge status={item.status} />
            </View>

            <View
              style={[
                styles.amountSummary,
                { backgroundColor: colors.cardAlt },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text variant="caption" sub>
                  Claim total
                </Text>

                <Text variant="h3">{money(item.totalAmount)}</Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text variant="caption" sub>
                  Items sum
                </Text>

                <Text variant="h3">{money(item.itemsSum)}</Text>
              </View>

              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <Text variant="caption" sub>
                  Difference
                </Text>

                <Text variant="h3" color={colors.danger}>
                  {item.difference > 0 ? '+' : ''}
                  {money(item.difference)}
                </Text>
              </View>
            </View>
          </Card>
        )}
        ListFooterComponent={<FooterLoader show={list.isLoadingMore} />}
        ListEmptyComponent={
          <EmptyState
            icon="shield-checkmark-outline"
            title="All good"
            message="Every claim total matches its items."
          />
        }
      />
    </ListShell>
  );
}

function LatestClaims({ filters }) {
  const { colors } = useTheme();
  const navigation = useNavigation();

  const list = usePagedList(useGetLatestClaimsQuery, filterParams(filters));

  console.log("Checking list: ", list);

  return (
    <ListShell list={list}>
      <FlatList
        data={list.items}
        keyExtractor={item => `${item.employeeId}-${item.claimId}`}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={list.refreshing}
        onRefresh={list.pullRefresh}
        onEndReached={list.loadMore}
        onEndReachedThreshold={0.4}
        renderItem={({ item }) => (
          <Card
            onPress={() =>
              navigation.navigate('ClaimDetail', {
                id: item.claimId,
                employeeName: item.employeeName,
              })
            }
            style={styles.claimCard}
          >
            <View style={styles.latestHeader}>
              <Avatar name={item.employeeName} size={ms(40)} />

              <View style={{ flex: 1 }}>
                <Text variant="h3" numberOfLines={1}>
                  {item.employeeName}
                </Text>

                <Text variant="caption" sub>
                  Claim #{item.claimId} · {fmtDate(item.claimDate)}
                </Text>
              </View>

              <View style={styles.latestAmount}>
                <Text variant="h3">{money(item.totalAmount)}</Text>

                <StatusBadge status={item.status} />
              </View>
            </View>

            <View
              style={[styles.approverRow, { backgroundColor: colors.cardAlt }]}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={ms(16)}
                color={colors.primary}
              />

              <Text
                variant="label"
                numberOfLines={1}
                style={styles.approverText}
              >
                {item.approverName
                  ? `Approver: ${item.approverName}`
                  : item.status === 'Submitted'
                  ? 'Waiting for an approver'
                  : 'No approver'}
              </Text>

              <Ionicons
                name="chevron-forward"
                size={ms(16)}
                color={colors.sub}
              />
            </View>
          </Card>
        )}
        ListFooterComponent={<FooterLoader show={list.isLoadingMore} />}
        ListEmptyComponent={
          <EmptyState
            icon="time-outline"
            title="No claims"
            message="No employee has submitted a claim yet."
          />
        }
      />
    </ListShell>
  );
}

export default function ReportsScreen() {
  const { colors } = useTheme();

  const s = useMemo(() => makeStyles(colors), [colors]);

  const user = useSelector(state => state.auth.user);

  const [tab, setTab] = useState('monthly');
  const [status, setStatus] = useState('All');
  const [days, setDays] = useState(90);
  const [categoryId, setCategoryId] = useState(null);
  const [employeeId, setEmployeeId] = useState(null);

  const filters = {
    status,
    categoryId,
    employeeId,
  };

  const firstName = (
    user?.name ||
    user?.fullName ||
    user?.firstName ||
    user?.userName ||
    'Admin'
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
              <Text style={s.welcomeText}>{greeting}</Text>

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
                <Text style={s.headerTitle}>Reports</Text>

                <View style={s.reportIcon}>
                  <Ionicons name="bar-chart" size={ms(16)} color="#FFFFFF" />
                </View>
              </View>

              <Text style={s.headerSubtitle}>
                Monitor team expenses and claim activity
              </Text>
            </View>
          </View>
        </View>

        <View style={s.tabsContainer}>
          <Segmented options={TABS} value={tab} onChange={setTab} />
        </View>

        <View style={s.chipContainer}>
          {tab === 'top' ? (
            <ChipRow options={DAYS} value={days} onChange={setDays} />
          ) : (
            <ChipRow options={STATUSES} value={status} onChange={setStatus} />
          )}
        </View>

        <FilterBar
          showCategory={tab !== 'top'}
          showEmployee
          categoryId={categoryId}
          onCategoryChange={setCategoryId}
          employeeId={employeeId}
          onEmployeeChange={setEmployeeId}
          style={s.filter}
        />

        <View style={{ flex: 1 }}>
          {tab === 'monthly' && <MonthlyTotals filters={filters} />}

          {tab === 'top' && (
            <TopCategories days={days} employeeId={employeeId} />
          )}

          {tab === 'mismatch' && <Mismatched filters={filters} />}

          {tab === 'latest' && <LatestClaims filters={filters} />}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: ms(16),
    paddingBottom: ms(24),
    flexGrow: 1,
  },

  employeeHeader: {
    // paddingHorizontal: ms(16),
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(10),
    paddingTop: ms(14),
    paddingBottom: ms(8),
  },

  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(4),
  },

  categoryCard: {
    marginBottom: ms(12),
  },

  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(12),
  },

  medal: {
    width: ms(40),
    height: ms(40),
    borderRadius: ms(14),
    alignItems: 'center',
    justifyContent: 'center',
  },

  progressTrack: {
    height: ms(8),
    borderRadius: ms(5),
    marginTop: ms(14),
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: ms(5),
  },

  claimCard: {
    marginBottom: ms(12),
  },

  claimHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: ms(8),
  },

  employeeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(10),
    flex: 1,
  },

  amountSummary: {
    flexDirection: 'row',
    marginTop: ms(14),
    borderRadius: ms(12),
    padding: ms(12),
    gap: ms(6),
  },

  latestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(10),
  },

  latestAmount: {
    alignItems: 'flex-end',
    gap: ms(6),
  },

  approverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: ms(12),
    borderRadius: ms(12),
    padding: ms(10),
    gap: ms(8),
  },

  approverText: {
    flex: 1,
  },
});

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
      marginBottom: ms(8),
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
    },

    titleContainer: {
      flex: 1,
      minWidth: 0,
    },

    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: ms(9),
    },

    headerTitle: {
      fontSize: fs(22),
      fontWeight: '900',
      letterSpacing: -0.5,
      color: '#FFFFFF',
    },

    reportIcon: {
      width: ms(30),
      height: ms(30),
      borderRadius: ms(10),
      backgroundColor: 'rgba(255,255,255,0.17)',
      alignItems: 'center',
      justifyContent: 'center',
    },

    headerSubtitle: {
      fontSize: fs(10),
      fontWeight: '500',
      color: 'rgba(255,255,255,0.8)',
      marginTop: ms(5),
    },

    tabsContainer: {
      paddingHorizontal: ms(16),
      paddingTop: ms(5),
    },

    chipContainer: {
      marginTop: ms(10),
      marginBottom: ms(4),
    },

    filter: {
      marginBottom: ms(8),
    },
  });
