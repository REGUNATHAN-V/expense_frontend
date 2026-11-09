import React from "react";
import { View, ScrollView, RefreshControl, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../theme/theme";
import { ms } from "../theme/scale";

export default function Screen({
    children,
    scroll = false,
    edges = ["left", "right"],
    refreshing,
    onRefresh,
    padded = true,
    contentStyle,
    keyboard = false,
}) {
    const { colors } = useTheme();
    const body = scroll ? (
        <ScrollView
            contentContainerStyle={[{ padding: padded ? 16 : 0, paddingBottom: ms(32) }, contentStyle]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            refreshControl={
                onRefresh ? (
                    <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
                ) : undefined
            }
        >
            {children}
        </ScrollView>
    ) : (
        <View style={[{ flex: 1, padding: padded ? 16 : 0 }, contentStyle]}>{children}</View>
    );

    return (
        <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: colors.card }}>
            {keyboard ? (
                <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                    {body}
                </KeyboardAvoidingView>
            ) : (
                body
            )}
        </SafeAreaView>
    );
}
