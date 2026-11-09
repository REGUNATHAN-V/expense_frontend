import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, StatusBar, StyleSheet, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useDispatch } from "react-redux";
import Text from "../../components/Text";
import Button from "../../components/Button";
import { useTheme } from "../../theme/theme";
import { Palette as P } from "../../theme/palette";
import { unlock, logout } from "../../api/redux/authSlice";
import { authenticate } from "../../utils/biometrics";
import { ms, fs } from "../../theme/scale";

const GRADIENT_LIGHT = [P.ElectricDp, P.VioletDp, P.Violet];
const GRADIENT_DARK = [P.Ink, P.Ink5, P.ElectricDp];
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const toHex = (rgb) => "#" + rgb.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
const sample = (stops, t) => {
    const seg = t * (stops.length - 1);
    const i = Math.min(Math.floor(seg), stops.length - 2);
    const f = seg - i;
    const a = hex(stops[i]);
    const b = hex(stops[i + 1]);
    return toHex(a.map((v, k) => v + (b[k] - v) * f));
};

function Gradient({ stops, steps = 48, children }) {
    const { height } = useWindowDimensions();
    const bands = useMemo(() => {
        const h = height / steps;
        return Array.from({ length: steps }, (_, i) => ({
            color: sample(stops, i / (steps - 1)),
            top: Math.floor(i * h),
            height: Math.ceil(h) + 2,
        }));
    }, [stops, steps, height]);

    return (
        <View style={[StyleSheet.absoluteFill, styles.clip]} pointerEvents="none">
            {bands.map((b, i) => (
                <View key={i} style={[styles.band, { top: b.top, height: b.height, backgroundColor: b.color }]} />
            ))}
            {children}
        </View>
    );
}

export default function LockScreen() {
    const { colors, isDark } = useTheme();
    const s = useMemo(() => makeStyles(colors), [colors]);
    const dispatch = useDispatch();
    const [busy, setBusy] = useState(false);

    const tryUnlock = useCallback(async () => {
        if (busy) return;
        setBusy(true);
        const ok = await authenticate("Unlock Expense Claim");
        setBusy(false);
        if (ok) dispatch(unlock());
    }, [busy, dispatch]);

    useEffect(() => {
        tryUnlock();
    }, []);

    return (
        <View style={s.root}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            <Gradient stops={isDark ? GRADIENT_DARK : GRADIENT_LIGHT}>
                <View style={s.glowTop} />
                <View style={s.glowLeft} />
                <View style={s.glowBottom} />
            </Gradient>

            <SafeAreaView edges={["top", "bottom", "left", "right"]} style={s.center}>
                <View style={s.card}>
                    <View style={s.iconCircle}>
                        <Ionicons name="finger-print" size={ms(44)} color={colors.primary} />
                    </View>
                    <Text variant="title" style={s.title}>
                        App locked
                    </Text>
                    <Text sub style={s.sub}>
                        Verify it's you to continue.
                    </Text>

                    <Button title="Unlock" icon="lock-open-outline" onPress={tryUnlock} loading={busy} style={s.stretch} />
                    <Button title="Sign out" variant="ghost" onPress={() => dispatch(logout())} style={[s.stretch, s.signOut]} />
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    clip: { overflow: "hidden" },
    band: { position: "absolute", left: 0, right: 0 },
});

const makeStyles = (colors) =>
    StyleSheet.create({
        root: { flex: 1 },
        center: { flex: 1, justifyContent: "center", padding: ms(22) },

        glowTop: { position: "absolute", top: -ms(90), right: -ms(70), width: ms(260), height: ms(260), borderRadius: ms(130), backgroundColor: colors.glass },
        glowLeft: { position: "absolute", top: ms(120), left: -ms(110), width: ms(220), height: ms(220), borderRadius: ms(110), backgroundColor: P.Electric + "38" },
        glowBottom: { position: "absolute", bottom: -ms(120), right: -ms(60), width: ms(300), height: ms(300), borderRadius: ms(150), backgroundColor: P.Violet + "47" },

        card: {
            backgroundColor: colors.card,
            borderRadius: ms(28),
            padding: ms(24),
            alignItems: "center",
            shadowColor: colors.shadow,
            shadowOpacity: 0.25,
            shadowRadius: 24,
            shadowOffset: { width: 0, height: 12 },
            elevation: 12,
        },
        iconCircle: { width: ms(104), height: ms(104), borderRadius: ms(52), backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center", marginBottom: ms(20) },
        title: { fontSize: fs(22) },
        sub: { marginTop: ms(6), marginBottom: ms(28), textAlign: "center" },

        stretch: { alignSelf: "stretch" },
        signOut: { marginTop: ms(12) },
    });