import React from "react";
import { Pressable, ActivityIndicator, View } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useTheme, radius } from "../theme/theme";
import Text from "./Text";
import { ms } from "../theme/scale";

export default function Button({ title, onPress, variant = "primary", icon, loading, disabled, style, small }) {
    const { colors } = useTheme();
    const map = {
        primary: { bg: colors.primary, fg: colors.onPrimary, border: "transparent" },
        secondary: { bg: colors.primarySoft, fg: colors.primary, border: "transparent" },
        danger: { bg: colors.danger, fg: "#FFFFFF", border: "transparent" },
        success: { bg: colors.success, fg: "#FFFFFF", border: "transparent" },
        warning: { bg: colors.warningSoft, fg: colors.warning, border: "transparent" },
        ghost: { bg: "transparent", fg: colors.text, border: colors.border },
    }[variant];
    const off = disabled || loading;

    return (
        <Pressable
            onPress={onPress}
            disabled={off}
            style={({ pressed }) => [
                {
                    backgroundColor: map.bg,
                    borderColor: map.border,
                    borderWidth: variant === "ghost" ? 1 : 0,
                    borderRadius: radius.md,
                    paddingVertical: small ? 10 : 15,
                    paddingHorizontal: ms(18),
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: ms(8),
                    opacity: off ? 0.55 : pressed ? 0.85 : 1,
                },
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator color={map.fg} />
            ) : (
                <>
                    {icon ? <Ionicons name={icon} size={small ? 16 : 19} color={map.fg} /> : null}
                    <Text variant="label" color={map.fg} style={{ fontSize: small ? 13 : 15 }}>
                        {title}
                    </Text>
                </>
            )}
        </Pressable>
    );
}
