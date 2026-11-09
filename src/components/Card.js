import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { ms } from "../theme/scale";
import { useTheme, radius, shadow } from "../theme/theme";

export default function Card({ children, onPress, style, padded = true }) {
    const { colors, isDark } = useTheme();
    const base = [
        {
            backgroundColor: colors.card,
            borderRadius: radius.lg,
            padding: padded ? ms(16) : 0,
            borderWidth: StyleSheet.hairlineWidth * 2,
            borderColor: colors.border,
        },
        !isDark && shadow(colors, 1),
        style,
    ];
    if (onPress) {
        return (
            <Pressable onPress={onPress} style={({ pressed }) => [...base, pressed && { opacity: 0.85, transform: [{ scale: 0.99 }] }]}>
                {children}
            </Pressable>
        );
    }
    return <View style={base}>{children}</View>;
}
