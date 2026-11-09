import React, { useMemo } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useTheme, shadow } from "../theme/theme";
import { ms, fs } from "../theme/scale";
import Text from "./Text";
import StatusBadge, { statusTone } from "./StatusBadge";
import Avatar from "./Avatar";
import { useGetCategoriesQuery } from "../api/apiSlice";
import { categoryIcon } from "../utils/categoryIcon";
import { money, fmtDate } from "../utils/format";

const MAX_CHIPS = 3;

export default function ClaimCard({ claim, onPress, showEmployee, employeeName }) {
    const { colors, isDark } = useTheme();
    const { data: categories = [] } = useGetCategoriesQuery();
    const tone = statusTone(colors, claim.status);
    const maker = employeeName || claim.employeeName;
    const catName = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c.name])), [categories]);

    const items = claim.items ?? [];
    const chips = useMemo(() => {
        const m = new Map();
        items.forEach((i) => m.set(i.categoryId, (m.get(i.categoryId) ?? 0) + Number(i.amount)));
        return [...m.entries()].map(([id, total]) => ({ id, total, name: catName[id] ?? "Item" }));
    }, [items, catName]);
    const itemsSum = items.reduce((s, i) => s + Number(i.amount), 0);
    const mismatch = items.length > 0 && Math.abs(itemsSum - claim.totalAmount) > 0.005;

    return (
        <Pressable
            onPress={onPress}
            android_ripple={{ color: colors.primarySoft }}
            style={({ pressed }) => [
                {
                    flexDirection: "row",
                    backgroundColor: colors.card,
                    borderRadius: ms(16),
                    marginBottom: ms(12),
                    overflow: "hidden",
                    borderWidth: StyleSheet.hairlineWidth * 2,
                    borderColor: colors.border,
                },
                !isDark && shadow(colors, 1),
                pressed && { opacity: 0.92, transform: [{ scale: 0.99 }] },
            ]}
        >
            <View style={{ width: ms(4), backgroundColor: tone.fg }} />

            <View style={{ flex: 1, padding: ms(12) }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View style={{ width: ms(38), height: ms(38), borderRadius: ms(12), backgroundColor: tone.bg, alignItems: "center", justifyContent: "center" }}>
                        <Ionicons name="receipt-outline" size={ms(19)} color={tone.fg} />
                    </View>
                    <View style={{ flex: 1, marginLeft: ms(10), marginRight: ms(8) }}>
                        <Text variant="h3" numberOfLines={1} style={{ fontSize: fs(14) }}>
                            Claim #{claim.id}
                        </Text>
                        <View style={{ flexDirection: "row", alignItems: "center", marginTop: ms(2) }}>
                            <Ionicons name="calendar-outline" size={ms(11)} color={colors.sub} />
                            <Text variant="caption" sub style={{ marginLeft: ms(4), fontSize: fs(11) }}>
                                {fmtDate(claim.claimDate)}
                            </Text>
                        </View>
                    </View>
                    <Text variant="amount" style={{ fontSize: fs(16) }}>
                        {money(claim.totalAmount)}
                    </Text>
                </View>

                {chips.length > 0 ? (
                    <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: ms(10), marginRight: -ms(6) }}>
                        {chips.slice(0, MAX_CHIPS).map((c) => (
                            <View
                                key={c.id}
                                style={{ flexDirection: "row", alignItems: "center", backgroundColor: colors.cardAlt, borderRadius: 999, paddingVertical: ms(4), paddingHorizontal: ms(9), marginRight: ms(6), marginBottom: ms(6) }}
                            >
                                <Ionicons name={categoryIcon(c.name)} size={ms(12)} color={colors.primary} />
                                <Text variant="caption" style={{ marginLeft: ms(4), fontWeight: "600", fontSize: fs(11) }}>
                                    {c.name}
                                </Text>
                                <Text variant="caption" sub style={{ marginLeft: ms(4), fontSize: fs(11) }}>
                                    {money(c.total)}
                                </Text>
                            </View>
                        ))}
                        {chips.length > MAX_CHIPS ? (
                            <View style={{ backgroundColor: colors.cardAlt, borderRadius: 999, paddingVertical: ms(4), paddingHorizontal: ms(9), marginBottom: ms(6) }}>
                                <Text variant="caption" sub style={{ fontWeight: "700", fontSize: fs(11) }}>
                                    +{chips.length - MAX_CHIPS}
                                </Text>
                            </View>
                        ) : null}
                    </View>
                ) : null}

                <View style={{ height: StyleSheet.hairlineWidth * 2, backgroundColor: colors.divider, marginTop: ms(4), marginBottom: ms(9) }} />
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <View style={{ flexDirection: "row", alignItems: "center", flexShrink: 1 }}>
                        <StatusBadge status={claim.status} />
                        {mismatch ? (
                            <View style={{ flexDirection: "row", alignItems: "center", marginLeft: ms(6), backgroundColor: colors.warningSoft, borderRadius: 999, paddingVertical: ms(3), paddingHorizontal: ms(7) }}>
                                <Ionicons name="warning" size={ms(11)} color={colors.warning} />
                                <Text variant="caption" color={colors.warning} style={{ marginLeft: ms(3), fontWeight: "800", fontSize: fs(10) }}>
                                    Mismatch
                                </Text>
                            </View>
                        ) : null}
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center", flexShrink: 1 }}>
                        {showEmployee ? (
                            <View style={{ flexDirection: "row", alignItems: "center", marginRight: ms(8), flexShrink: 1 }}>
                                <Avatar name={maker || `E ${claim.employeeId}`} size={ms(18)} />
                                <Text variant="caption" sub numberOfLines={1} style={{ marginLeft: ms(4), fontSize: fs(11), flexShrink: 1 }}>
                                    {maker || `Emp #${claim.employeeId}`}
                                </Text>
                            </View>
                        ) : null}
                        <Text variant="caption" sub style={{ fontSize: fs(11) }}>
                            {items.length} item{items.length === 1 ? "" : "s"}
                        </Text>
                        <Ionicons name="chevron-forward" size={ms(14)} color={colors.sub} style={{ marginLeft: ms(2) }} />
                    </View>
                </View>
            </View>
        </Pressable>
    );
}