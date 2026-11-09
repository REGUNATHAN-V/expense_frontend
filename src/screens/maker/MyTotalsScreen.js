import React, { useMemo, useState } from "react";
import {
    View,
    SectionList,
    Pressable,
    ScrollView,
    StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import Ionicons from "react-native-vector-icons/Ionicons";

import Screen from "../../components/Screen";
import Text from "../../components/Text";
import SectionHeader from "../../components/SectionHeader";
import FilterBar from "../../components/FilterBar";
import {
    Loader,
    EmptyState,
    ErrorState,
    FooterLoader,
} from "../../components/States";

import { useTheme } from "../../theme/theme";
import { useGetMyMonthlyTotalsQuery } from "../../api/apiSlice";
import usePagedList from "../../utils/usePagedList";
import { money, fmtMonth, errMsg, cleanParams } from "../../utils/format";
import { ms, fs } from "../../theme/scale";
import MenuButton from "../../navigation/MenuButton";

const STATUSES = [
    "All",
    "Draft",
    "Submitted",
    "Approved",
    "Rejected",
    "Returned",
];

export function groupByMonth(rows) {
    const map = new Map();

    rows.forEach((r) => {
        const key = r.month ?? "none";

        if (!map.has(key)) {
            map.set(key, []);
        }

        map.get(key).push(r);
    });

    return [...map.entries()]
        .sort((a, b) => (a[0] < b[0] ? 1 : -1))
        .map(([month, data]) => ({
            month,
            data,
            total: data.reduce((sum, r) => sum + r.total, 0),
        }));
}

export default function MyTotalsScreen() {
    const { colors } = useTheme();
    const s = useMemo(() => makeStyles(colors), [colors]);

    const navigation = useNavigation();
    const user = useSelector((st) => st.auth.user);

    const [status, setStatus] = useState("All");
    const [categoryId, setCategoryId] = useState(null);

    const list = usePagedList(
        useGetMyMonthlyTotalsQuery,
        cleanParams({ status, categoryId }),
        50
    );

    const sections = useMemo(
        () => groupByMonth(list.items.filter((r) => r.month)),
        [list.items]
    );

    const count = `${list.items.length}${list.hasNext ? "+" : ""}`;

    const firstName = (
        user?.name ||
        user?.fullName ||
        user?.firstName ||
        user?.userName ||
        "there"
    )
        .trim()
        .split(/\s+/)[0];

    const now = new Date();
    const hour = now.getHours();

    const greeting =
        hour < 12
            ? "GOOD MORNING"
            : hour < 17
                ? "GOOD AFTERNOON"
                : "GOOD EVENING";

    const today = now.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
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
                                    Monthly Totals
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
                                Track your expenses month by month
                            </Text>
                        </View>

                        <View style={s.headerIcon}>
                            <Ionicons
                                name="stats-chart"
                                size={ms(24)}
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
                    {STATUSES.map((value) => {
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
                    categoryId={categoryId}
                    onCategoryChange={setCategoryId}
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
                    <SectionList
                        sections={sections}
                        keyExtractor={(item, index) =>
                            `${item.month}-${item.categoryId}-${index}`
                        }
                        stickySectionHeadersEnabled
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={s.listContent}
                        refreshing={list.refreshing}
                        onRefresh={list.pullRefresh}
                        onEndReached={list.loadMore}
                        onEndReachedThreshold={0.4}

                        // ListHeaderComponent={
                        //     sections.length > 0 ? (
                        //         <View style={s.listHeading}>
                        //             <Text style={s.listTitle}>
                        //                 Monthly Breakdown
                        //             </Text>

                        //             <Text style={s.listCount}>
                        //                 {count} records
                        //             </Text>
                        //         </View>
                        //     ) : null
                        // }

                        renderSectionHeader={({ section }) => (
                            <SectionHeader
                                title={fmtMonth(section.month)}
                                right={money(section.total)}
                            />
                        )}

                        renderItem={({ item, index, section }) => (
                            <Pressable
                                onPress={() =>
                                    navigation.navigate("CategoryItems", {
                                        month: item.month,
                                        categoryId: item.categoryId,
                                        category: item.category,
                                        total: item.total,
                                        status:
                                            status === "All"
                                                ? undefined
                                                : status,
                                    })
                                }
                                android_ripple={{
                                    color: colors.primarySoft,
                                }}
                                style={[
                                    s.categoryRow,
                                    {
                                        borderTopLeftRadius:
                                            index === 0 ? ms(16) : 0,
                                        borderTopRightRadius:
                                            index === 0 ? ms(16) : 0,
                                        borderBottomLeftRadius:
                                            index === section.data.length - 1
                                                ? ms(16)
                                                : 0,
                                        borderBottomRightRadius:
                                            index === section.data.length - 1
                                                ? ms(16)
                                                : 0,
                                        marginBottom:
                                            index === section.data.length - 1
                                                ? ms(12)
                                                : 0,
                                        borderBottomWidth:
                                            index === section.data.length - 1
                                                ? 0
                                                : StyleSheet.hairlineWidth,
                                    },
                                ]}
                            >
                                <View style={s.categoryInfo}>
                                    <View style={s.categoryIcon}>
                                        <Ionicons
                                            name="pricetag-outline"
                                            size={ms(17)}
                                            color={colors.primary}
                                        />
                                    </View>

                                    <Text
                                        style={s.categoryName}
                                        numberOfLines={1}
                                    >
                                        {item.category ?? "—"}
                                    </Text>
                                </View>

                                <View style={s.amountContainer}>
                                    <Text style={s.amount}>
                                        {money(item.total)}
                                    </Text>

                                    <Ionicons
                                        name="chevron-forward"
                                        size={ms(17)}
                                        color={colors.sub}
                                    />
                                </View>
                            </Pressable>
                        )}

                        ListFooterComponent={
                            <FooterLoader show={list.isLoadingMore} />
                        }

                        ListEmptyComponent={
                            <EmptyState
                                icon="stats-chart-outline"
                                title="No monthly totals"
                                message="Your expense claims will appear here once you create them."
                            />
                        }
                    />
                )}
            </View>
        </Screen>
    );
}

const makeStyles = (colors) =>
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
            overflow: "hidden",
            marginBottom: ms(6),
        },

        decorationOne: {
            position: "absolute",
            width: ms(190),
            height: ms(190),
            borderRadius: ms(95),
            backgroundColor: "rgba(255,255,255,0.07)",
            top: -ms(115),
            right: -ms(45),
        },

        decorationTwo: {
            position: "absolute",
            width: ms(125),
            height: ms(125),
            borderRadius: ms(63),
            backgroundColor: "rgba(255,255,255,0.06)",
            bottom: -ms(75),
            left: ms(95),
        },

        headerTop: {
            flexDirection: "row",
            alignItems: "center",
            gap: ms(10),
        },

        greetingContainer: {
            flex: 1,
            minWidth: 0,
        },

        welcomeText: {
            fontSize: fs(9),
            fontWeight: "800",
            letterSpacing: 1.4,
            color: "rgba(255,255,255,0.75)",
        },

        greeting: {
            fontSize: fs(18),
            fontWeight: "900",
            color: "#FFFFFF",
            marginTop: ms(3),
        },

        dateBadge: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: ms(5),
            backgroundColor: "rgba(255,255,255,0.16)",
            paddingHorizontal: ms(9),
            paddingVertical: ms(9),
            borderRadius: ms(12),
            flexShrink: 1,
        },

        dateText: {
            fontSize: fs(9),
            fontWeight: "700",
            color: "#FFFFFF",
        },

        headerDivider: {
            height: StyleSheet.hairlineWidth,
            backgroundColor: "rgba(255,255,255,0.25)",
            marginVertical: ms(17),
        },

        headerBottom: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: ms(8),
        },

        titleContainer: {
            flex: 1,
            minWidth: 0,
        },

        titleRow: {
            flexDirection: "row",
            alignItems: "center",
            gap: ms(8),
        },

        headerTitle: {
            fontSize: fs(18),
            fontWeight: "900",
            letterSpacing: -0.5,
            color: "#FFFFFF",
        },

        countBadge: {
            backgroundColor: "rgba(255,255,255,0.2)",
            paddingHorizontal: ms(8),
            paddingVertical: ms(3),
            borderRadius: ms(8),
        },

        countText: {
            fontSize: fs(10),
            fontWeight: "800",
            color: "#FFFFFF",
        },

        headerSubtitle: {
            fontSize: fs(10),
            fontWeight: "500",
            color: "rgba(255,255,255,0.8)",
            marginTop: ms(5),
        },

        headerIcon: {
            width: ms(43),
            height: ms(43),
            borderRadius: ms(14),
            backgroundColor: "rgba(255,255,255,0.16)",
            alignItems: "center",
            justifyContent: "center",
        },

        // Status Filters
        chipScroll: {
            flexGrow: 0,
            marginBottom: ms(6),
        },

        chipContent: {
            padding: ms(16),
            alignItems: "center",
        },

        chip: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
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
            fontWeight: "700",
            color: colors.sub,
        },

        chipTextActive: {
            color: colors.onPrimary,
            fontWeight: "800",
        },

        filter: {
            marginBottom: ms(8),
        },

        // Monthly Breakdown
        listContent: {
            paddingHorizontal: ms(16),
            paddingTop: ms(4),
            paddingBottom: ms(24),
            flexGrow: 1,
        },

        listHeading: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: ms(5),
            marginBottom: ms(11),
        },

        listTitle: {
            fontSize: fs(14),
            fontWeight: "800",
            color: colors.text,
        },

        listCount: {
            fontSize: fs(11),
            fontWeight: "600",
            color: colors.sub,
        },

        categoryRow: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingVertical: ms(13),
            paddingHorizontal: ms(14),
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
        },

        categoryInfo: {
            flex: 1,
            minWidth: 0,
            flexDirection: "row",
            alignItems: "center",
            gap: ms(10),
        },

        categoryIcon: {
            width: ms(36),
            height: ms(36),
            borderRadius: ms(11),
            backgroundColor: colors.primarySoft,
            alignItems: "center",
            justifyContent: "center",
        },

        categoryName: {
            flex: 1,
            fontSize: fs(13),
            fontWeight: "700",
            color: colors.text,
        },

        amountContainer: {
            flexDirection: "row",
            alignItems: "center",
            gap: ms(5),
            marginLeft: ms(8),
        },

        amount: {
            fontSize: fs(13),
            fontWeight: "800",
            color: colors.text,
        },
    });