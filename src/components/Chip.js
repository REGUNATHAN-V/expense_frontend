import React from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useTheme } from "../theme/theme";
import { ms, fs } from "../theme/scale";
import Text from "./Text";

export function Chip({ label, active, onPress }) {
    const { colors } = useTheme();
    return (
        <Pressable
            onPress={onPress}
            style={{
                height: ms(36),
                paddingHorizontal: ms(16),
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 999,
                backgroundColor: active ? colors.primary : colors.card,
                borderWidth: StyleSheet.hairlineWidth * 2,
                borderColor: active ? colors.primary : colors.border,
            }}
        >
            <Text variant="label" color={active ? colors.onPrimary : colors.sub} style={{ fontSize: fs(13), fontWeight: active ? "800" : "600" }}>
                {label}
            </Text>
        </Pressable>
    );
}

export function ChipRow({ options, value, onChange, style }) {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={[{ flexGrow: 0, height: ms(44) }, style]}
            contentContainerStyle={{ alignItems: "center", paddingHorizontal: ms(16) }}
        >
            {options.map((o, i) => (
                <View key={String(o.value)} style={{ marginRight: i === options.length - 1 ? 0 : ms(8) }}>
                    <Chip label={o.label} active={o.value === value} onPress={() => onChange(o.value)} />
                </View>
            ))}
        </ScrollView>
    );
}
