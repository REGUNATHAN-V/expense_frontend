
import React, { useMemo } from "react";
import {
    View,
    Alert,
    Pressable,
    Linking,
    StyleSheet,
} from "react-native";

import Ionicons from "react-native-vector-icons/Ionicons";
import { useSelector } from "react-redux";

import Screen from "../../components/Screen";
import Card from "../../components/Card";
import Text from "../../components/Text";
import Button from "../../components/Button";
import StatusBadge, { statusTone } from "../../components/StatusBadge";
import Avatar from "../../components/Avatar";

import { Loader, ErrorState } from "../../components/States";
import { useTheme } from "../../theme/theme";
import { ms, fs } from "../../theme/scale";

import {
    useGetMyClaimQuery,
    useGetApproverClaimQuery,
    useGetAdminClaimQuery,
    useGetCategoriesQuery,
    useCancelClaimMutation,
    useDecideClaimMutation,
} from "../../api/apiSlice";

import { categoryIcon } from "../../utils/categoryIcon";
import { money, fmtDate, errMsg } from "../../utils/format";

const fmtDateTime = (iso) => {
    if (!iso) return "—";

    const d = new Date(
        iso.endsWith("Z") || iso.includes("+")
            ? iso
            : `${iso}Z`
    );

    return `${fmtDate(
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    )}, ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

// Compact fact
function Fact({ icon, label, value, colors, s }) {
    return (
        <View style={s.fact}>
            <View style={s.factLabelRow}>
                <Ionicons
                    name={icon}
                    size={ms(12)}
                    color={colors.sub}
                />

                <Text style={s.factLabel} sub>
                    {label}
                </Text>
            </View>

            <Text
                style={s.factValue}
                numberOfLines={1}
            >
                {value}
            </Text>
        </View>
    );
}

// Maker and approver
function PeopleCard({ claim, makerName, colors, s }) {
    const decided = [
        "Approved",
        "Rejected",
        "Returned",
    ].includes(claim.status);

    const verb =
        claim.status === "Approved"
            ? "Approved"
            : claim.status === "Rejected"
            ? "Rejected"
            : claim.status === "Returned"
            ? "Returned"
            : "Decision";

    const approver =
        claim.approverName ||
        (claim.approverId
            ? `Approver #${claim.approverId}`
            : null);

    return (
        <Card style={s.peopleCard}>

            <View style={s.personRow}>
                <Avatar
                    name={makerName || `E ${claim.employeeId}`}
                    size={ms(34)}
                />

                <View style={s.personInfo}>
                    <Text style={s.personLabel} sub>
                        Maker
                    </Text>

                    <Text
                        style={s.personName}
                        numberOfLines={1}
                    >
                        {makerName || `Employee #${claim.employeeId}`}
                    </Text>
                </View>

                <Text style={s.personId} sub>
                    #{claim.employeeId}
                </Text>
            </View>

            <View style={s.peopleDivider} />

            <View style={s.personRow}>
                {approver ? (
                    <Avatar
                        name={approver}
                        size={ms(34)}
                    />
                ) : (
                    <View style={s.waitingIcon}>
                        <Ionicons
                            name="hourglass-outline"
                            size={ms(17)}
                            color={colors.sub}
                        />
                    </View>
                )}

                <View style={s.personInfo}>
                    <Text style={s.personLabel} sub>
                        {decided && approver
                            ? `${verb} by`
                            : "Approver"}
                    </Text>

                    <Text
                        style={s.personName}
                        numberOfLines={1}
                    >
                        {approver ??
                            (claim.status === "Submitted"
                                ? "Waiting for an approver"
                                : "Not assigned")}
                    </Text>

                    {claim.decidedAt ? (
                        <Text style={s.decidedDate} sub>
                            {fmtDateTime(claim.decidedAt)}
                        </Text>
                    ) : null}
                </View>

                {claim.approverId ? (
                    <Text style={s.personId} sub>
                        #{claim.approverId}
                    </Text>
                ) : null}
            </View>
        </Card>
    );
}

export default function ClaimDetailScreen({ route, navigation }) {
    const { id, employeeName } = route.params;

    const { colors } = useTheme();
    const s = useMemo(() => makeStyles(colors), [colors]);

    const role = useSelector(
        (state) => state.auth.user?.role
    );

    const isApprover = role === 2;
    const isAdmin = role === 3;

    const mine = useGetMyClaimQuery(id, {
        skip: isApprover || isAdmin,
    });

    const theirs = useGetApproverClaimQuery(id, {
        skip: !isApprover,
    });

    const admin = useGetAdminClaimQuery(id, {
        skip: !isAdmin,
    });

    const q = isAdmin
        ? admin
        : isApprover
        ? theirs
        : mine;

    const claim = q.data;

    const { data: categories = [] } = useGetCategoriesQuery();

    const cats = useMemo(
        () =>
            Object.fromEntries(
                categories.map((c) => [c.id, c])
            ),
        [categories]
    );

    const [cancelClaim, cancelState] =
        useCancelClaimMutation();

    const [decide, decideState] =
        useDecideClaimMutation();

    if (q.isLoading) return <Loader />;

    if (q.error || !claim) {
        return (
            <ErrorState
                message={errMsg(q.error)}
                onRetry={q.refetch}
            />
        );
    }

    const tone = statusTone(colors, claim.status);

    const itemsSum = claim.items.reduce(
        (sum, item) => sum + Number(item.amount),
        0
    );

    const diff = claim.totalAmount - itemsSum;
    const mismatch = Math.abs(diff) > 0.005;

    const canEdit =
        !isApprover &&
        !isAdmin &&
        ["Draft", "Returned"].includes(claim.status);

    const canCancel =
        !isApprover &&
        !isAdmin &&
        ["Draft", "Submitted"].includes(claim.status);

    const canDecide =
        isApprover && claim.status === "Submitted";

    const showOwner = isApprover || isAdmin;

    const makerName = claim.employeeName || employeeName;

    const confirm = (title, message, onOk, destructive) =>
        Alert.alert(title, message, [
            {
                text: "No",
                style: "cancel",
            },
            {
                text: "Yes",
                style: destructive ? "destructive" : "default",
                onPress: onOk,
            },
        ]);

    const run = async (fn) => {
        try {
            await fn().unwrap();
            navigation.goBack();
        } catch (e) {
            Alert.alert("Couldn't complete", errMsg(e));
        }
    };

    return (
        <Screen
            scroll
            edges={["left", "right", "bottom"]}
            onRefresh={q.refetch}
            refreshing={q.isFetching && !q.isLoading}
        >

            <View style={s.hero}>

                <View style={[s.heroTop, { backgroundColor: tone.bg }]}>
                    <View style={s.heroTitleRow}>
                        <View style={s.receiptIcon}>
                            <Ionicons
                                name="receipt-outline"
                                size={ms(18)}
                                color={tone.fg}
                            />
                        </View>

                        <View style={{marginLeft: ms(8)}}>
                            <Text style={[s.claimLabel, { color: tone.fg }]}>
                                CLAIM DETAILS
                            </Text>

                            <Text style={[s.claimNumber, { color: tone.fg }]}>
                                #{claim.id}
                            </Text>
                        </View>
                    </View>

                    <StatusBadge
                        status={claim.status}
                        large
                    />
                </View>

                <View style={s.heroBody}>
                    <Text style={s.totalLabel} sub>
                        TOTAL CLAIMED
                    </Text>

                    <Text style={s.totalAmount}>
                        {money(claim.totalAmount)}
                    </Text>

                    <View style={s.heroDivider} />

                    <View style={s.factsRow}>
                        <Fact
                            icon="calendar-outline"
                            label="Claim date"
                            value={fmtDate(claim.claimDate)}
                            colors={colors}
                            s={s}
                        />

                        <View style={s.factDivider} />

                        <Fact
                            icon="layers-outline"
                            label="Total items"
                            value={String(claim.items.length)}
                            colors={colors}
                            s={s}
                        />
                    </View>
                </View>
            </View>

            {showOwner ? (
                <PeopleCard
                    claim={claim}
                    makerName={makerName}
                    colors={colors}
                    s={s}
                />
            ) : null}

            <View style={s.sectionHeader}>
                <Text style={s.sectionTitle}>
                    Amount Summary
                </Text>
            </View>

            <View style={s.totalsRow}>
                {[
                    {
                        label: "Claim total",
                        value: money(claim.totalAmount),
                        color: colors.text,
                    },
                    {
                        label: "Items sum",
                        value: money(itemsSum),
                        color: colors.text,
                    },
                    {
                        label: "Difference",
                        value: `${diff > 0 ? "+" : ""}${money(diff)}`,
                        color: mismatch
                            ? colors.danger
                            : colors.success,
                    },
                ].map((item) => (
                    <View
                        key={item.label}
                        style={s.totalCard}
                    >
                        <Text
                            style={s.totalCardLabel}
                            sub
                        >
                            {item.label}
                        </Text>

                        <Text
                            style={[
                                s.totalCardValue,
                                { color: item.color },
                            ]}
                            numberOfLines={1}
                            adjustsFontSizeToFit
                        >
                            {item.value}
                        </Text>
                    </View>
                ))}
            </View>

            {mismatch ? (
                <View style={s.warningBox}>
                    <Ionicons
                        name="warning-outline"
                        size={ms(18)}
                        color={colors.warning}
                    />

                    <Text style={s.warningText} color={colors.warning}>
                        Total ({money(claim.totalAmount)}) doesn't
                        match the items ({money(itemsSum)}).
                    </Text>
                </View>
            ) : null}

            <View style={s.sectionHeader}>
                <View style={s.itemsTitleRow}>
                    <Text style={s.sectionTitle}>
                        Expense Items
                    </Text>
                </View>
            </View>

            {claim.items.map((it, index) => {
                const cat = cats[it.categoryId];

                const over =
                    cat?.maxPerItem != null &&
                    Number(it.amount) > Number(cat.maxPerItem);

                return (
                    <Card
                        key={it.id}
                        style={s.itemCard}
                    >
                        <View style={s.itemHeader}>
                            <View style={s.itemIcon}>
                                <Ionicons
                                    name={categoryIcon(cat?.name)}
                                    size={ms(19)}
                                    color={colors.primary}
                                />
                            </View>

                            <View style={s.itemInfo}>
                                <Text
                                    style={s.itemCategory}
                                    numberOfLines={1}
                                >
                                    {cat?.name ??
                                        `Category #${it.categoryId}`}
                                </Text>

                                <View style={s.itemDateRow}>
                                    <Ionicons
                                        name="calendar-outline"
                                        size={ms(11)}
                                        color={colors.sub}
                                    />

                                    <Text style={s.itemDate} sub>
                                        {fmtDate(it.expenseDate)}
                                    </Text>
                                </View>
                            </View>

                            <Text style={s.itemAmount}>
                                {money(it.amount)}
                            </Text>
                        </View>

                        {it.description ? (
                            <Text
                                style={s.itemDescription}
                                sub
                            >
                                {it.description}
                            </Text>
                        ) : null}

                        {over ||
                        it.receiptUrl ||
                        cat?.maxPerItem != null ? (
                            <View style={s.itemFooter}>

                                {cat?.maxPerItem != null ? (
                                    <View
                                        style={[
                                            s.limitBadge,
                                            {
                                                backgroundColor: over
                                                    ? colors.dangerSoft
                                                    : colors.cardAlt,
                                            },
                                        ]}
                                    >
                                        <Ionicons
                                            name={
                                                over
                                                    ? "alert-circle-outline"
                                                    : "shield-checkmark-outline"
                                            }
                                            size={ms(12)}
                                            color={
                                                over
                                                    ? colors.danger
                                                    : colors.sub
                                            }
                                        />

                                        <Text
                                            style={[
                                                s.limitText,
                                                {
                                                    color: over
                                                        ? colors.danger
                                                        : colors.sub,
                                                },
                                            ]}
                                        >
                                            {over
                                                ? "Over limit"
                                                : "Limit"}{" "}
                                            {money(cat.maxPerItem)}
                                        </Text>
                                    </View>
                                ) : null}

                                {it.receiptUrl ? (
                                    <Pressable
                                        onPress={() =>
                                            Linking.openURL(it.receiptUrl)
                                        }
                                        hitSlop={8}
                                        style={s.receiptButton}
                                    >
                                        <Ionicons
                                            name="attach-outline"
                                            size={ms(15)}
                                            color={colors.primary}
                                        />

                                        <Text style={s.receiptText}>
                                            View receipt
                                        </Text>
                                    </Pressable>
                                ) : null}
                            </View>
                        ) : null}
                    </Card>
                );
            })}

            {canEdit || canCancel || canDecide ? (
                <View style={s.actionsContainer}>

                    {canEdit ? (
                        <Button
                            title="Edit claim"
                            icon="create-outline"
                            onPress={() =>
                                navigation.navigate("ClaimForm", {
                                    claim,
                                })
                            }
                            style={s.actionButton}
                        />
                    ) : null}

                    {canCancel ? (
                        <Button
                            title="Cancel claim"
                            icon="close-circle-outline"
                            variant="danger"
                            loading={cancelState.isLoading}
                            style={s.actionButton}
                            onPress={() =>
                                confirm(
                                    "Cancel claim",
                                    "This can't be undone.",
                                    () => run(() => cancelClaim(claim.id)),
                                    true
                                )
                            }
                        />
                    ) : null}

                    {canDecide ? (
                        <>
                            <Button
                                title="Approve"
                                icon="checkmark-circle-outline"
                                variant="success"
                                loading={decideState.isLoading}
                                style={s.actionButton}
                                onPress={() =>
                                    confirm(
                                        "Approve claim",
                                        `Approve ${money(claim.totalAmount)}?`,
                                        () =>
                                            run(() =>
                                                decide({
                                                    id: claim.id,
                                                    action: "approve",
                                                })
                                            )
                                    )
                                }
                            />

                            <View style={s.decisionRow}>
                                <Button
                                    title="Return"
                                    icon="return-up-back-outline"
                                    variant="warning"
                                    style={s.decisionButton}
                                    disabled={decideState.isLoading}
                                    onPress={() =>
                                        confirm(
                                            "Return to maker",
                                            "The maker can edit and resubmit it.",
                                            () =>
                                                run(() =>
                                                    decide({
                                                        id: claim.id,
                                                        action: "return",
                                                    })
                                                )
                                        )
                                    }
                                />

                                <Button
                                    title="Reject"
                                    icon="close-outline"
                                    variant="danger"
                                    style={s.decisionButton}
                                    disabled={decideState.isLoading}
                                    onPress={() =>
                                        confirm(
                                            "Reject claim",
                                            "This is final.",
                                            () =>
                                                run(() =>
                                                    decide({
                                                        id: claim.id,
                                                        action: "reject",
                                                    })
                                                ),
                                            true
                                        )
                                    }
                                />
                            </View>
                        </>
                    ) : null}
                </View>
            ) : null}

        </Screen>
    );
}

const makeStyles = (colors) =>
    StyleSheet.create({

        // Hero
        hero: {
            backgroundColor: colors.card,
            borderRadius: ms(19),
            overflow: "hidden",
            borderWidth: StyleSheet.hairlineWidth * 2,
            borderColor: colors.border,
            marginBottom: ms(13),
        },

        heroTop: {
            paddingHorizontal: ms(13),
            paddingVertical: ms(11),
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
        },

        heroTitleRow: {
            flexDirection: "row",
            alignItems: "center",
        },

        receiptIcon: {
            width: ms(34),
            height: ms(34),
            borderRadius: ms(10),
            backgroundColor: "rgba(255,255,255,0.35)",
            alignItems: "center",
            justifyContent: "center",
        },

        claimLabel: {
            fontSize: fs(9),
            fontWeight: "700",
            letterSpacing: 0.8,
        },

        claimNumber: {
            fontSize: fs(13),
            fontWeight: "900",
            marginTop: ms(2),
        },

        heroBody: {
            padding: ms(14),
        },

        totalLabel: {
            fontSize: fs(9),
            fontWeight: "700",
            letterSpacing: 1,
        },

        totalAmount: {
            fontSize: fs(20),
            fontWeight: "900",
            color: colors.text,
            marginTop: ms(3),
        },

        heroDivider: {
            height: StyleSheet.hairlineWidth * 2,
            backgroundColor: colors.divider,
            marginVertical: ms(12),
        },

        factsRow: {
            flexDirection: "row",
            alignItems: "center",
        },

        fact: {
            flex: 1,
            minWidth: 0,
        },

        factLabelRow: {
            flexDirection: "row",
            alignItems: "center",
        },

        factLabel: {
            fontSize: fs(9),
            marginLeft: ms(4),
        },

        factValue: {
            fontSize: fs(12),
            fontWeight: "800",
            color: colors.text,
            marginTop: ms(3),
        },

        factDivider: {
            width: StyleSheet.hairlineWidth * 2,
            height: ms(30),
            backgroundColor: colors.divider,
            marginHorizontal: ms(15),
        },

        // People
        peopleCard: {
            marginBottom: ms(13),
            padding: ms(12),
        },

        personRow: {
            flexDirection: "row",
            alignItems: "center",
        },

        personInfo: {
            flex: 1,
            marginLeft: ms(9),
            minWidth: 0,
        },

        personLabel: {
            fontSize: fs(9),
        },

        personName: {
            fontSize: fs(11),
            fontWeight: "800",
            color: colors.text,
            marginTop: ms(2),
        },

        personId: {
            fontSize: fs(9),
            fontWeight: "600",
        },

        waitingIcon: {
            width: ms(34),
            height: ms(34),
            borderRadius: ms(17),
            backgroundColor: colors.mutedSoft,
            alignItems: "center",
            justifyContent: "center",
        },

        peopleDivider: {
            height: StyleSheet.hairlineWidth * 2,
            backgroundColor: colors.divider,
            marginVertical: ms(11),
        },

        decidedDate: {
            fontSize: fs(9),
            marginTop: ms(3),
        },

        // Section headings
        sectionHeader: {
            marginBottom: ms(9),
        },

        sectionTitle: {
            fontSize: fs(13),
            fontWeight: "900",
            color: colors.text,
        },

        // Totals
        totalsRow: {
            flexDirection: "row",
            marginBottom: ms(12),
            gap: ms(7),
        },

        totalCard: {
            flex: 1,
            minWidth: 0,
            backgroundColor: colors.card,
            borderRadius: ms(12),
            padding: ms(9),
            borderWidth: StyleSheet.hairlineWidth * 2,
            borderColor: colors.border,
        },

        totalCardLabel: {
            fontSize: fs(8),
            fontWeight: "600",
        },

        totalCardValue: {
            fontSize: fs(12),
            fontWeight: "900",
            marginTop: ms(4),
        },

        // Warning
        warningBox: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.warningSoft,
            padding: ms(10),
            borderRadius: ms(11),
            marginBottom: ms(13),
        },

        warningText: {
            flex: 1,
            fontSize: fs(10),
            fontWeight: "700",
            marginLeft: ms(8),
            lineHeight: fs(15),
        },

        // Items
        itemsTitleRow: {
            flexDirection: "row",
            alignItems: "center",
            gap: ms(7),
        },

        itemsCount: {
            minWidth: ms(21),
            height: ms(21),
            borderRadius: ms(7),
            backgroundColor: colors.primarySoft,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: ms(5),
        },

        itemsCountText: {
            fontSize: fs(9),
            fontWeight: "800",
            color: colors.primary,
        },

        itemCard: {
            marginBottom: ms(9),
            padding: ms(11),
        },

        itemHeader: {
            flexDirection: "row",
            alignItems: "center",
        },

        itemIcon: {
            width: ms(37),
            height: ms(37),
            borderRadius: ms(11),
            backgroundColor: colors.primarySoft,
            alignItems: "center",
            justifyContent: "center",
        },

        itemInfo: {
            flex: 1,
            marginLeft: ms(9),
            minWidth: 0,
        },

        itemCategory: {
            fontSize: fs(12),
            fontWeight: "800",
            color: colors.text,
        },

        itemDateRow: {
            flexDirection: "row",
            alignItems: "center",
            marginTop: ms(3),
        },

        itemDate: {
            fontSize: fs(9),
            marginLeft: ms(4),
        },

        itemAmount: {
            fontSize: fs(14),
            fontWeight: "900",
            color: colors.text,
            marginLeft: ms(5),
        },

        itemDescription: {
            fontSize: fs(10),
            lineHeight: fs(15),
            marginTop: ms(9),
        },

        itemFooter: {
            flexDirection: "row",
            alignItems: "center",
            flexWrap: "wrap",
            gap: ms(8),
            marginTop: ms(10),
        },

        limitBadge: {
            flexDirection: "row",
            alignItems: "center",
            borderRadius: ms(7),
            paddingVertical: ms(5),
            paddingHorizontal: ms(8),
            gap: ms(4),
        },

        limitText: {
            fontSize: fs(9),
            fontWeight: "700",
        },

        receiptButton: {
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: ms(4),
        },

        receiptText: {
            fontSize: fs(10),
            fontWeight: "700",
            color: colors.primary,
            marginLeft: ms(3),
        },

        // Actions
        actionsContainer: {
            marginTop: ms(8),
            marginBottom: ms(12),
            gap: ms(9),
        },

        actionButton: {
            marginBottom: 0,
        },

        decisionRow: {
            flexDirection: "row",
            gap: ms(9),
        },

        decisionButton: {
            flex: 1,
        },
    });
