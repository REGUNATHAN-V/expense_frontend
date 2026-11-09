import React from "react";
import { View } from "react-native";
import { useTheme } from "../theme/theme";
import Text from "./Text";
import Ionicons from "react-native-vector-icons/Ionicons";
import { ms, fs } from "../theme/scale";

export function statusTone(colors, status) {
    switch (status) {
        case "Approved":
            return { fg: colors.success, bg: colors.successSoft, icon: "checkmark-circle" };
        case "Submitted":
            return { fg: colors.info, bg: colors.infoSoft, icon: "paper-plane" };
        case "Rejected":
            return { fg: colors.danger, bg: colors.dangerSoft, icon: "close-circle" };
        case "Returned":
            return { fg: colors.warning, bg: colors.warningSoft, icon: "return-up-back" };
        case "Cancelled":
            return { fg: colors.sub, bg: colors.mutedSoft, icon: "ban" };
        default: 
            return { fg: colors.sub, bg: colors.mutedSoft, icon: "create" };
    }
}

export default function StatusBadge({ status, large }) {
    const { colors } = useTheme();
    const t = statusTone(colors, status);
    return (
        <View
            style={{
                flexDirection: "row",
                alignItems: "center",
                gap: ms(5),
                backgroundColor: t.bg,
                paddingHorizontal: ms(large ? 12 : 9),
                paddingVertical: ms(large ? 6 : 4),
                borderRadius: 999,
                alignSelf: "flex-start",
            }}
        >
            <Ionicons name={t.icon} size={ms(large ? 15 : 12)} color={t.fg} />
            <Text variant="caption" color={t.fg} style={{ fontWeight: "800", fontSize: fs(large ? 13 : 11) }}>
                {status}
            </Text>
        </View>
    );
}
