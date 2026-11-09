import React from "react";
import { Pressable } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useTheme } from "../theme/theme";
import { ms } from "../theme/scale";
import { useDrawer } from "./DrawerContext";

export default function MenuButton({ style }) {
    const { colors } = useTheme();
    const { open } = useDrawer();
    return (
        <Pressable
            onPress={open}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Open menu"
            style={({ pressed }) => [
                {
                    width: ms(40),
                    height: ms(40),
                    borderRadius: ms(13),
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: pressed ? colors.primarySoft : colors.iconBg,
                },
                style,
            ]}
        >
            <Ionicons name="menu" size={ms(22)} color={colors.primary} />
        </Pressable>
    );
}