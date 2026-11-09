import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "../theme/theme";
import { ms, fs } from "../theme/scale";
import Text from "./Text";
import MenuButton from "../navigation/MenuButton";

export default function ScreenHeader({ title, subtitle, badge, right, showMenu = true }) {
    const { colors } = useTheme();

    return (
        <View style={styles.row}>
            {showMenu ? <MenuButton style={{ marginLeft: 0, marginRight: ms(12) }} /> : null}

            <View style={styles.texts}>
                <View style={styles.titleRow}>
                    <Text numberOfLines={1} style={[styles.title, { color: colors.text }]}>
                        {title}
                    </Text>
                    {badge != null && badge !== "" ? (
                        <View style={[styles.badge, { backgroundColor: colors.primarySoft }]}>
                            <Text style={[styles.badgeText, { color: colors.primary }]}>{badge}</Text>
                        </View>
                    ) : null}
                </View>
                {subtitle ? (
                    <Text numberOfLines={1} style={[styles.subtitle, { color: colors.sub }]}>
                        {subtitle}
                    </Text>
                ) : null}
            </View>

            {right ? <View style={styles.right}>{right}</View> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: ms(16),
        paddingTop: ms(10),
        paddingBottom: ms(14),
    },
    texts: {
        flex: 1,
        minWidth: 0,
    },
    titleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: ms(8),
    },
    title: {
        flexShrink: 1,
        fontSize: fs(20),
        fontWeight: "800",
        letterSpacing: -0.4,
    },
    badge: {
        minWidth: ms(24),
        height: ms(20),
        paddingHorizontal: ms(7),
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
    },
    badgeText: {
        fontSize: fs(11),
        fontWeight: "800",
    },
    subtitle: {
        fontSize: fs(12),
        marginTop: ms(2),
    },
    right: {
        marginLeft: ms(10),
    },
});