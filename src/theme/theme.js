import { useMemo } from "react";
import { useColorScheme, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import { DarkColors, LightColors } from "./palette";
import { ms, s, vs } from "./scale";

export { Palette } from "./palette";
export { s, vs, ms, fs } from "./scale";

export const radius = { sm: ms(10), md: ms(14), lg: ms(20), xl: ms(26), pill: 999 };
export const space = { xs: s(4), sm: s(8), md: s(12), lg: s(16), xl: s(24), xxl: s(32) };

export function useTheme() {
    const mode = useSelector((s) => s.settings.themeMode);
    const system = useColorScheme();
    const isDark = mode === "system" ? system === "dark" : mode === "dark";
    return useMemo(() => ({ isDark, mode, colors: isDark ? DarkColors : LightColors }), [isDark, mode]);
}

export function useStyles(factory) {
    const { colors } = useTheme();
    return useMemo(() => StyleSheet.create(factory(colors)), [colors]);
}

export const shadow = (c, level = 1) => ({
    shadowColor: c.shadow,
    shadowOpacity: c.isDark ? 0.4 : level === 1 ? 0.08 : 0.16,
    shadowRadius: level === 1 ? ms(10) : ms(18),
    shadowOffset: { width: 0, height: level === 1 ? vs(3) : vs(8) },
    elevation: level === 1 ? 3 : 8,
});
