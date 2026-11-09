import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import Text from "../components/Text";
import { useTheme } from "../theme/theme";
import { ms, fs } from "../theme/scale";

export default function TabBar({ state, descriptors, navigation }) {
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();

    return (
        <View
            style={{
                flexDirection: "row",
                alignItems: "flex-end",
                backgroundColor: colors.card,
                borderTopLeftRadius: ms(24),
                borderTopRightRadius: ms(24),
                borderTopWidth: StyleSheet.hairlineWidth * 2,
                borderColor: colors.border,
                paddingTop: ms(8),
                paddingBottom: Math.max(insets.bottom, ms(8)),
                paddingHorizontal: ms(8),
                shadowColor: colors.shadow,
                shadowOpacity: isDark ? 0.5 : 0.1,
                shadowRadius: ms(14),
                shadowOffset: { width: 0, height: -ms(4) },
                elevation: 14,
            }}
        >
            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const focused = state.index === index;
                const isFab = route.name === "New";
                const label = options.tabBarLabel ?? options.title ?? route.name;

                const onPress = () => {
                    const e = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
                    if (!focused && !e.defaultPrevented) navigation.navigate(route.name, route.params);
                };

                if (isFab) {
                    return (
                        <View key={route.key} style={{ flex: 1, alignItems: "center" }}>
                            <Pressable
                                onPress={onPress}
                                accessibilityRole="button"
                                accessibilityLabel="New claim"
                                style={({ pressed }) => ({
                                    width: ms(56),
                                    height: ms(56),
                                    borderRadius: ms(28),
                                    marginTop: -ms(30),
                                    backgroundColor: colors.primary,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderWidth: ms(4),
                                    borderColor: colors.bg,
                                    shadowColor: colors.primary,
                                    shadowOpacity: 0.45,
                                    shadowRadius: ms(10),
                                    shadowOffset: { width: 0, height: ms(5) },
                                    elevation: 0,
                                    transform: [{ scale: pressed ? 0.94 : 1 }],
                                })}
                            >
                                <Ionicons name="add" size={ms(30)} color={colors.onPrimary} />
                            </Pressable>
                        </View>
                    );
                }

                const tint = focused ? colors.primary : colors.sub;
                return (
                    <Pressable key={route.key} onPress={onPress} accessibilityRole="tab" accessibilityState={{ selected: focused }} style={{ flex: 1, alignItems: "center", paddingVertical: ms(2) }}>
                        <View
                            style={{
                                paddingHorizontal: ms(18),
                                paddingVertical: ms(5),
                                borderRadius: 999,
                                backgroundColor: focused ? colors.primarySoft : "transparent",
                            }}
                        >
                            {options.tabBarIcon?.({ focused, color: tint, size: ms(22) })}
                        </View>
                        <Text variant="caption" color={tint} style={{ fontSize: fs(11), fontWeight: focused ? "800" : "600", marginTop: ms(2) }} numberOfLines={1}>
                            {label}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}
