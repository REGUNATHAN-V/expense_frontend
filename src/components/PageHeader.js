import React from "react";
import { View } from "react-native";
import { ms } from "../theme/scale";
import Text from "./Text";

export default function PageHeader({ eyebrow, title, subtitle, right, style }) {
    return (
        <View style={[{ flexDirection: "row", alignItems: "center", paddingHorizontal: ms(16), paddingTop: ms(14), paddingBottom: ms(4) }, style]}>
            <View style={{ flex: 1 }}>
                {eyebrow ? (
                    <Text variant="label" sub>
                        {eyebrow}
                    </Text>
                ) : null}
                <Text variant="title">{title}</Text>
                {subtitle ? (
                    <Text sub style={{ marginTop: ms(2) }}>
                        {subtitle}
                    </Text>
                ) : null}
            </View>
            {right}
        </View>
    );
}
