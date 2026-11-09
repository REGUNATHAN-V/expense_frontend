import React from "react";
import { View } from "react-native";
import { useTheme } from "../theme/theme";
import { ms } from "../theme/scale";
import Text from "./Text";

export default function SectionHeader({ title, right, style }) {
    const { colors } = useTheme();
    return (
        <View style={[{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: ms(14), paddingBottom: ms(8), backgroundColor: colors.bg }, style]}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={{ width: ms(4), height: ms(16), borderRadius: 2, backgroundColor: colors.primary, marginRight: ms(8) }} />
                <Text variant="h3">{title}</Text>
            </View>
            {right ? (
                <View style={{ backgroundColor: colors.primarySoft, paddingHorizontal: ms(10), paddingVertical: ms(4), borderRadius: 999 }}>
                    <Text variant="label" color={colors.primary} style={{ fontWeight: "800" }}>
                        {right}
                    </Text>
                </View>
            ) : null}
        </View>
    );
}
