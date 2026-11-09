import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { useTheme, shadow } from "../theme/theme";
import { ms, fs } from "../theme/scale";
import Text from "./Text";

export default function Segmented({ options, value, onChange, style }) {
    const { colors, isDark } = useTheme();
    return (
        <View
            style={[
                {
                    flexDirection: "row",
                    height: ms(46),
                    alignItems: "stretch",
                    backgroundColor: colors.cardAlt,
                    borderRadius: ms(16),
                    padding: ms(4),
                    borderWidth: StyleSheet.hairlineWidth * 2,
                    borderColor: colors.border,
                },
                style,
            ]}
        >
            {options.map((o) => {
                const active = o.value === value;
                return (
                    <Pressable
                        key={String(o.value)}
                        onPress={() => onChange(o.value)}
                        style={[
                            {
                                flex: 1,
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: ms(12),
                                backgroundColor: active ? colors.primary : "transparent",
                            },
                            active && !isDark && shadow(colors, 1),
                        ]}
                    >
                        <Text variant="label" numberOfLines={1} color={active ? colors.onPrimary : colors.sub} style={{ fontSize: fs(13), fontWeight: active ? "800" : "600" }}>
                            {o.label}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}
