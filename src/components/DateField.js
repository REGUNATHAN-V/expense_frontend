import React, { useState } from "react";
import { View, Pressable, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useTheme, radius } from "../theme/theme";
import Text from "./Text";
import { fromISODate, toISODate, fmtDate } from "../utils/format";
import { ms } from "../theme/scale";

export default function DateField({ label, value, onChange, maximumDate }) {
    const { colors, isDark } = useTheme();
    const [show, setShow] = useState(false);

    const handle = (e, d) => {
        if (Platform.OS === "android") setShow(false);
        if (e?.type === "dismissed") return;
        if (d) onChange(toISODate(d));
    };

    return (
        <View style={{ marginBottom: ms(14) }}>
            {label ? (
                <Text variant="label" sub style={{ marginBottom: ms(6) }}>
                    {label}
                </Text>
            ) : null}
            {Platform.OS === "ios" ? (
                <View style={{ alignItems: "flex-start" }}>
                    <DateTimePicker
                        value={fromISODate(value)}
                        mode="date"
                        display="compact"
                        maximumDate={maximumDate}
                        themeVariant={isDark ? "dark" : "light"}
                        onChange={handle}
                    />
                </View>
            ) : (
                <>
                    <Pressable
                        onPress={() => setShow(true)}
                        style={{ flexDirection: "row", alignItems: "center", gap: ms(10), backgroundColor: colors.input, borderRadius: radius.md, padding: ms(14) }}
                    >
                        <Ionicons name="calendar-outline" size={ms(18)} color={colors.sub} />
                        <Text>{fmtDate(value)}</Text>
                    </Pressable>
                    {show ? <DateTimePicker value={fromISODate(value)} mode="date" maximumDate={maximumDate} onChange={handle} /> : null}
                </>
            )}
        </View>
    );
}
