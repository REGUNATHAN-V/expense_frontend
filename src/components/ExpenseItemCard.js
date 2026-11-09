
import React from "react";
import {
    View,
    Pressable,
    Linking,
    StyleSheet,
} from "react-native";

import Ionicons from "react-native-vector-icons/Ionicons";

import { useTheme, shadow } from "../theme/theme";
import { ms, fs } from "../theme/scale";

import Text from "./Text";
import StatusBadge, { statusTone } from "./StatusBadge";
import Avatar from "./Avatar";

import { categoryIcon } from "../utils/categoryIcon";
import { money, fmtDate } from "../utils/format";

export default function ExpenseItemCard({
    item,
    showMaker,
    onPress,
}) {
    const { colors, isDark } = useTheme();
    const s = makeStyles(colors);

    const tone = statusTone(colors, item.status);

    const approverText = item.approverName
        ? `${
            item.status === "Approved"
                ? "Approved"
                : item.status === "Rejected"
                ? "Rejected"
                : item.status === "Returned"
                ? "Returned"
                : "Decided"
        } by ${item.approverName}`
        : item.status === "Submitted"
        ? "Waiting for an approver"
        : "No approver";

    return (
        <Pressable
            onPress={onPress}
            android_ripple={{ color: colors.primarySoft }}
            style={({ pressed }) => [
                s.card,
                !isDark && shadow(colors, 1),
                pressed && s.pressed,
            ]}
        >
            <View style={[s.indicator, { backgroundColor: tone.fg }]} />

            <View style={s.content}>

                <View style={s.topRow}>
                    <View style={s.categoryIcon}>
                        <Ionicons
                            name={categoryIcon(item.category)}
                            size={ms(19)}
                            color={colors.primary}
                        />
                    </View>

                    <View style={s.categoryInfo}>
                        <Text
                            style={s.category}
                            numberOfLines={1}
                        >
                            {item.category}
                        </Text>

                        <View style={s.dateRow}>
                            <Ionicons
                                name="calendar-outline"
                                size={ms(11)}
                                color={colors.sub}
                            />

                            <Text style={s.date}>
                                {fmtDate(item.expenseDate)}
                            </Text>
                        </View>
                    </View>

                    <Text style={s.amount}>
                        {money(item.amount)}
                    </Text>
                </View>

                {item.description ? (
                    <Text
                        style={s.description}
                        sub
                        numberOfLines={2}
                    >
                        {item.description}
                    </Text>
                ) : null}

                <View style={s.infoContainer}>

                    {showMaker ? (
                        <View style={s.infoRow}>
                            <Avatar
                                name={item.employeeName}
                                size={ms(25)}
                            />

                            <View style={s.infoText}>
                                <Text style={s.infoLabel} sub>
                                    Maker
                                </Text>

                                <Text
                                    style={s.infoValue}
                                    numberOfLines={1}
                                >
                                    {item.employeeName ||
                                        `Employee #${item.employeeId}`}
                                </Text>
                            </View>
                        </View>
                    ) : null}

                    <View style={s.infoRow}>
                        <View
                            style={[
                                s.approverIcon,
                                { backgroundColor: tone.bg },
                            ]}
                        >
                            <Ionicons
                                name="shield-checkmark-outline"
                                size={ms(14)}
                                color={tone.fg}
                            />
                        </View>

                        <View style={s.infoText}>
                            <Text style={s.infoLabel} sub>
                                Approver
                            </Text>

                            <Text
                                style={s.infoValue}
                                numberOfLines={1}
                            >
                                {approverText}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={s.footer}>

                    <View style={s.footerLeft}>
                        <StatusBadge status={item.status} />

                        <Text style={s.claimNumber} sub>
                            #{item.claimId}
                        </Text>
                    </View>

                    <View style={s.footerRight}>
                        {item.receiptUrl ? (
                            <Pressable
                                onPress={(e) => {
                                    e.stopPropagation();
                                    Linking.openURL(item.receiptUrl);
                                }}
                                hitSlop={8}
                                style={s.receiptButton}
                            >
                                <Ionicons
                                    name="attach-outline"
                                    size={ms(15)}
                                    color={colors.primary}
                                />

                                <Text style={s.receiptText}>
                                    Receipt
                                </Text>
                            </Pressable>
                        ) : null}

                        <Ionicons
                            name="chevron-forward"
                            size={ms(15)}
                            color={colors.sub}
                        />
                    </View>
                </View>
            </View>
        </Pressable>
    );
}

const makeStyles = (colors) =>
    StyleSheet.create({

        card: {
            flexDirection: "row",
            backgroundColor: colors.card,
            borderRadius: ms(15),
            overflow: "hidden",
            borderWidth: StyleSheet.hairlineWidth * 2,
            borderColor: colors.border,
        },

        indicator: {
            width: ms(4),
        },

        content: {
            flex: 1,
            padding: ms(11),
            minWidth: 0,
        },

        topRow: {
            flexDirection: "row",
            alignItems: "center",
        },

        categoryIcon: {
            width: ms(38),
            height: ms(38),
            borderRadius: ms(11),
            backgroundColor: colors.primarySoft,
            alignItems: "center",
            justifyContent: "center",
        },

        categoryInfo: {
            flex: 1,
            marginLeft: ms(9),
            minWidth: 0,
        },

        category: {
            fontSize: fs(12),
            fontWeight: "800",
            color: colors.text,
        },

        dateRow: {
            flexDirection: "row",
            alignItems: "center",
            marginTop: ms(3),
        },

        date: {
            fontSize: fs(9),
            fontWeight: "500",
            color: colors.sub,
            marginLeft: ms(4),
        },

        amount: {
            fontSize: fs(14),
            fontWeight: "900",
            color: colors.text,
            marginLeft: ms(6),
        },

        description: {
            fontSize: fs(10),
            lineHeight: fs(15),
            marginTop: ms(8),
        },

        infoContainer: {
            backgroundColor: colors.cardAlt,
            borderRadius: ms(10),
            paddingHorizontal: ms(9),
            paddingVertical: ms(8),
            marginTop: ms(10),
            gap: ms(8),
        },

        infoRow: {
            flexDirection: "row",
            alignItems: "center",
            minHeight: ms(25),
        },

        infoText: {
            flex: 1,
            marginLeft: ms(8),
            minWidth: 0,
        },

        infoLabel: {
            fontSize: fs(9),
            fontWeight: "500",
        },

        infoValue: {
            fontSize: fs(10),
            fontWeight: "700",
            color: colors.text,
            marginTop: ms(1),
        },

        approverIcon: {
            width: ms(25),
            height: ms(25),
            borderRadius: ms(8),
            alignItems: "center",
            justifyContent: "center",
        },

        footer: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: ms(10),
        },

        footerLeft: {
            flexDirection: "row",
            alignItems: "center",
            flexShrink: 1,
        },

        claimNumber: {
            fontSize: fs(9),
            fontWeight: "600",
            marginLeft: ms(7),
        },

        footerRight: {
            flexDirection: "row",
            alignItems: "center",
        },

        receiptButton: {
            flexDirection: "row",
            alignItems: "center",
            marginRight: ms(7),
        },

        receiptText: {
            fontSize: fs(10),
            fontWeight: "700",
            color: colors.primary,
            marginLeft: ms(2),
        },

        pressed: {
            opacity: 0.9,
            transform: [{ scale: 0.99 }],
        },
    });
