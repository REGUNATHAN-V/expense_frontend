
import React, { useMemo } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useSelector } from "react-redux";

import Screen from "../../components/Screen";
import Text from "../../components/Text";
import Avatar from "../../components/Avatar";
import ExpenseItemCard from "../../components/ExpenseItemCard";

import {
    Loader,
    EmptyState,
    ErrorState,
    FooterLoader,
} from "../../components/States";

import { useTheme } from "../../theme/theme";
import {
    useGetMyCategoryItemsQuery,
    useGetAdminCategoryItemsQuery,
} from "../../api/apiSlice";

import usePagedList from "../../utils/usePagedList";
import { categoryIcon } from "../../utils/categoryIcon";
import {
    money,
    fmtMonth,
    monthRange,
    cleanParams,
    errMsg,
} from "../../utils/format";

import { ms, fs } from "../../theme/scale";

export default function CategoryItemsScreen({ route, navigation }) {
    const {
        employeeId,
        employeeName,
        month,
        categoryId,
        category,
        total,
        status,
    } = route.params;

    const { colors } = useTheme();
    const s = useMemo(() => makeStyles(colors), [colors]);

    const isAdmin = useSelector(
        (state) => state.auth.user?.role
    ) === 3;

    const params = useMemo(
        () =>
            cleanParams({
                employeeId: isAdmin ? employeeId : undefined,
                categoryId,
                status,
                ...monthRange(month),
            }),
        [isAdmin, employeeId, categoryId, status, month]
    );

    const list = usePagedList(
        isAdmin
            ? useGetAdminCategoryItemsQuery
            : useGetMyCategoryItemsQuery,
        params
    );

    const count = `${list.items.length}${list.hasNext ? "+" : ""}`;

    if (list.isLoading) return <Loader />;

    if (list.error && list.items.length === 0) {
        return (
            <ErrorState
                message={errMsg(list.error)}
                onRetry={list.refresh}
            />
        );
    }

    const header = (
        <View style={s.header}>
            <View style={s.decorationOne} />
            <View style={s.decorationTwo} />

            <View style={s.headerTop}>
                <View style={s.iconBox}>
                    <Ionicons
                        name={categoryIcon(category)}
                        size={ms(22)}
                        color={colors.primary}
                    />
                </View>

                <View style={s.categoryInfo}>
                    <Text style={s.categoryTitle} numberOfLines={1}>
                        {category}
                    </Text>

                    <View style={s.metaRow}>
                        <Ionicons
                            name="calendar-outline"
                            size={ms(12)}
                            color="rgba(255,255,255,0.8)"
                        />

                        <Text style={s.metaText}>
                            {fmtMonth(month)}
                        </Text>

                        {status ? (
                            <>
                                <View style={s.dot} />
                                <Text style={s.metaText}>
                                    {status}
                                </Text>
                            </>
                        ) : null}
                    </View>
                </View>
            </View>

            {isAdmin && employeeName ? (
                <View style={s.employeeRow}>
                    <Avatar
                        name={employeeName}
                        size={ms(27)}
                    />

                    <Text style={s.employeeName}>
                        {employeeName}
                    </Text>
                </View>
            ) : null}

            <View style={s.divider} />

            <View style={s.summaryRow}>
                <View>
                    <Text style={s.totalLabel}>
                        TOTAL EXPENSE
                    </Text>

                    <Text style={s.totalAmount}>
                        {money(total)}
                    </Text>
                </View>

                <View style={s.countBadge}>
                    <Ionicons
                        name="receipt-outline"
                        size={ms(13)}
                        color="#FFFFFF"
                    />

                    <Text style={s.countText}>
                        {count} {list.items.length === 1 && !list.hasNext ? "Item" : "Items"}
                    </Text>
                </View>
            </View>
        </View>
    );

    return (
        <Screen padded={false} edges={["left", "right", "bottom"]}>
            <FlatList
                data={list.items}
                keyExtractor={(item) => String(item.itemId)}
                contentContainerStyle={s.listContent}
                showsVerticalScrollIndicator={false}
                refreshing={list.refreshing}
                onRefresh={list.pullRefresh}
                onEndReached={list.loadMore}
                onEndReachedThreshold={0.4}
                ListHeaderComponent={header}
                renderItem={({ item }) => (
                    <ExpenseItemCard
                        item={item}
                        showMaker={isAdmin}
                        onPress={() =>
                            navigation.navigate("ClaimDetail", {
                                id: item.claimId,
                                employeeName: item.employeeName,
                            })
                        }
                    />
                )}
                ItemSeparatorComponent={() => (
                    <View style={s.itemSeparator} />
                )}
                ListFooterComponent={
                    <FooterLoader show={list.isLoadingMore} />
                }
                ListEmptyComponent={
                    <EmptyState
                        icon="receipt-outline"
                        title="No items"
                        message="No expenses found for this record."
                    />
                }
            />
        </Screen>
    );
}

const makeStyles = (colors) =>
    StyleSheet.create({
        listContent: {
            paddingHorizontal: ms(14),
            paddingTop: ms(12),
            paddingBottom: ms(22),
            flexGrow: 1,
        },

        // Compact curved header
        header: {
            backgroundColor: colors.primary,
            paddingHorizontal: ms(16),
            paddingTop: ms(17),
            paddingBottom: ms(17),
            borderRadius: ms(22),
            overflow: "hidden",
            marginBottom: ms(14),
        },

        decorationOne: {
            position: "absolute",
            width: ms(145),
            height: ms(145),
            borderRadius: ms(73),
            backgroundColor: "rgba(255,255,255,0.07)",
            top: -ms(95),
            right: -ms(35),
        },

        decorationTwo: {
            position: "absolute",
            width: ms(100),
            height: ms(100),
            borderRadius: ms(50),
            backgroundColor: "rgba(255,255,255,0.06)",
            bottom: -ms(65),
            left: ms(100),
        },

        headerTop: {
            flexDirection: "row",
            alignItems: "center",
        },

        iconBox: {
            width: ms(43),
            height: ms(43),
            borderRadius: ms(13),
            backgroundColor: "#FFFFFF",
            alignItems: "center",
            justifyContent: "center",
        },

        categoryInfo: {
            flex: 1,
            marginLeft: ms(11),
            minWidth: 0,
        },

        categoryTitle: {
            fontSize: fs(16),
            fontWeight: "800",
            color: "#FFFFFF",
        },

        metaRow: {
            flexDirection: "row",
            alignItems: "center",
            marginTop: ms(5),
        },

        metaText: {
            fontSize: fs(10),
            fontWeight: "600",
            color: "rgba(255,255,255,0.82)",
            marginLeft: ms(4),
        },

        dot: {
            width: ms(3),
            height: ms(3),
            borderRadius: ms(2),
            backgroundColor: "rgba(255,255,255,0.7)",
            marginHorizontal: ms(7),
        },

        employeeRow: {
            flexDirection: "row",
            alignItems: "center",
            marginTop: ms(12),
        },

        employeeName: {
            fontSize: fs(11),
            fontWeight: "700",
            color: "#FFFFFF",
            marginLeft: ms(8),
        },

        divider: {
            height: StyleSheet.hairlineWidth,
            backgroundColor: "rgba(255,255,255,0.25)",
            marginVertical: ms(13),
        },

        summaryRow: {
            flexDirection: "row",
            alignItems: "flex-end",
            justifyContent: "space-between",
        },

        totalLabel: {
            fontSize: fs(9),
            fontWeight: "800",
            letterSpacing: 1,
            color: "rgba(255,255,255,0.75)",
        },

        totalAmount: {
            fontSize: fs(23),
            fontWeight: "900",
            color: "#FFFFFF",
            marginTop: ms(3),
        },

        countBadge: {
            flexDirection: "row",
            alignItems: "center",
            gap: ms(5),
            backgroundColor: "rgba(255,255,255,0.17)",
            paddingHorizontal: ms(10),
            paddingVertical: ms(7),
            borderRadius: ms(10),
        },

        countText: {
            fontSize: fs(10),
            fontWeight: "800",
            color: "#FFFFFF",
        },

        itemSeparator: {
            height: ms(9),
        },
    });
