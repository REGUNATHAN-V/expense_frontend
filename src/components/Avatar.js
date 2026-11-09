import React from "react";
import { View } from "react-native";
import { ms } from "../theme/scale";
import { useTheme } from "../theme/theme";
import Text from "./Text";
import { initials } from "../utils/format";

export default function Avatar({ name, size = ms(44) }) {
    const { colors } = useTheme();
    return (
        <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" }}>
            <Text variant="h3" color={colors.primary} style={{ fontSize: size * 0.36 }}>
                {initials(name)}
            </Text>
        </View>
    );
}
