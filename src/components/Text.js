import React from "react";
import { Text as RNText } from "react-native";
import { useTheme } from "../theme/theme";
import { fs } from "../theme/scale";

const variants = {
    title: { fontSize: fs(26), fontWeight: "800", letterSpacing: -0.5 },
    h2: { fontSize: fs(20), fontWeight: "700", letterSpacing: -0.3 },
    h3: { fontSize: fs(16), fontWeight: "700" },
    body: { fontSize: fs(15), fontWeight: "400" },
    label: { fontSize: fs(13), fontWeight: "600" },
    caption: { fontSize: fs(12), fontWeight: "500" },
    amount: { fontSize: fs(18), fontWeight: "800", fontVariant: ["tabular-nums"] },
};

export default function Text({ variant = "body", color, sub, style, children, ...rest }) {
    const { colors } = useTheme();
    return (
        <RNText {...rest} style={[{ color: color || (sub ? colors.sub : colors.text) }, variants[variant], style]}>
            {children}
        </RNText>
    );
}
