import React, { useState } from "react";
import { View, TextInput, Pressable } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useTheme, radius } from "../theme/theme";
import Text from "./Text";
import { ms, fs } from "../theme/scale";

export default function Input({ label, icon, error, secure, style, ...rest }) {
    const { colors } = useTheme();
    const [hidden, setHidden] = useState(!!secure);
    const [focused, setFocused] = useState(false);

    return (
        <View style={[{ marginBottom: ms(14) }, style]}>
            {label ? (
                <Text variant="label" sub style={{ marginBottom: ms(6) }}>
                    {label}
                </Text>
            ) : null}
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: colors.input,
                    borderRadius: radius.md,
                    borderWidth: 1.5,
                    borderColor: error ? colors.danger : focused ? colors.borderFocused : colors.border,
                    paddingHorizontal: ms(14),
                    gap: ms(10),
                }}
            >
                {icon ? <Ionicons name={icon} size={ms(18)} color={colors.sub} /> : null}
                <TextInput
                    {...rest}
                    secureTextEntry={hidden}
                    placeholderTextColor={colors.muted}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    style={{ flex: 1, color: colors.text, paddingVertical: ms(14), fontSize: fs(15) }}
                />
                {secure ? (
                    <Pressable onPress={() => setHidden((h) => !h)} hitSlop={10}>
                        <Ionicons name={hidden ? "eye-off-outline" : "eye-outline"} size={ms(19)} color={colors.sub} />
                    </Pressable>
                ) : null}
            </View>
            {error ? (
                <Text variant="caption" color={colors.danger} style={{ marginTop: ms(4) }}>
                    {error}
                </Text>
            ) : null}
        </View>
    );
}
