import React from "react";
import { Pressable } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useDispatch } from "react-redux";
import { useTheme } from "../theme/theme";
import { ms } from "../theme/scale";
import { setThemeMode } from "../api/redux/settingsSlice";

export default function HeaderThemeToggle({ onDark = false }) {
    const { colors, isDark } = useTheme();
    const dispatch = useDispatch();
    return (
        <Pressable
            onPress={() => dispatch(setThemeMode(isDark ? "light" : "dark"))}
            hitSlop={10}
            style={{ width: ms(38), height: ms(38), borderRadius: ms(12), alignItems: "center", justifyContent: "center", backgroundColor: onDark ? "#FFFFFF26" : colors.iconBg }}
        >
            <Ionicons name={isDark ? "sunny-outline" : "moon-outline"} size={ms(20)} color={onDark ? "#FFFFFF" : colors.primary} />
        </Pressable>
    );
}
