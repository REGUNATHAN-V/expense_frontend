import React, { useMemo, useState } from "react";
import { View, Pressable, ScrollView, StatusBar, KeyboardAvoidingView, StyleSheet, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useDispatch } from "react-redux";
import Text from "../../components/Text";
import Input from "../../components/Input";
import Button from "../../components/Button";
import Segmented from "../../components/Segmented";
import { useTheme } from "../../theme/theme";
import { Palette as P } from "../../theme/palette";
import { useRegisterMutation } from "../../api/apiSlice";
import { setCredentials } from "../../api/redux/authSlice";
import { errMsg } from "../../utils/format";
import { ms, fs } from "../../theme/scale";

const ROLE_OPTIONS = [
    { label: "Maker", value: 1 },
    { label: "Approver", value: 2 },
    { label: "Admin", value: 3 },
];

// Gradient stops (top -> bottom), all from the palette
const GRADIENT_LIGHT = [P.ElectricDp, P.VioletDp, P.Violet];
const GRADIENT_DARK = [P.Ink, P.Ink5, P.ElectricDp];

// ---- tiny gradient (plain Views, no extra library) ----
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

// Exact pixel tops + overlap = no gaps (no horizontal lines)
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

export default function RegisterScreen({ navigation }) {
    const { colors, isDark } = useTheme();
    const s = useMemo(() => makeStyles(colors), [colors]);
    const dispatch = useDispatch();
    const [register, { isLoading }] = useRegisterMutation();
    const [form, setForm] = useState({ name: "", email: "", password: "", role: 1 });
    const [error, setError] = useState("");
    const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

    const submit = async () => {
        setError("");
        if (!form.name.trim()) return setError("Enter your name.");
        if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return setError("Enter a valid email.");
        if (form.password.length < 8) return setError("Password must be at least 8 characters.");
        try {
            const user = await register({ ...form, name: form.name.trim(), email: form.email.trim() }).unwrap();
            dispatch(setCredentials(user));
        } catch (e) {
            setError(errMsg(e));
        }
    };

    return (
        <View style={s.root}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

            <Gradient stops={isDark ? GRADIENT_DARK : GRADIENT_LIGHT}>
                <View style={s.glowTop} />
                <View style={s.glowLeft} />
                <View style={s.glowBottom} />
            </Gradient>

            <SafeAreaView edges={["top", "bottom", "left", "right"]} style={s.root}>
                <KeyboardAvoidingView style={s.root} behavior="padding">
                    <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

                        <View style={s.hero}>
                            <Text variant="label" color={colors.onPrimary} style={s.eyebrow}>
                                Get started
                            </Text>
                            <Text variant="title" color={colors.onPrimary} style={s.title}>
                                Create account
                            </Text>
                        </View>

                        <View style={s.card}>
                            <Input label="Full name" icon="person-outline" value={form.name} onChangeText={set("name")} placeholder="Jane Doe" />
                            <Input label="Email" icon="mail-outline" value={form.email} onChangeText={set("email")} autoCapitalize="none" keyboardType="email-address" placeholder="you@company.com" />
                            <Input label="Password" icon="lock-closed-outline" value={form.password} onChangeText={set("password")} secure placeholder="Min. 8 characters" />

                            <Text variant="label" sub style={s.roleLabel}>
                                Role
                            </Text>
                            <Segmented options={ROLE_OPTIONS} value={form.role} onChange={set("role")} style={s.segmented} />

                            {error ? (
                                <View style={s.errorBox}>
                                    <Text variant="label" color={colors.danger}>
                                        {error}
                                    </Text>
                                </View>
                            ) : null}

                            <Button title="Create account" icon="person-add-outline" onPress={submit} loading={isLoading} />
                        </View>

                        <Pressable onPress={() => navigation.goBack()} style={s.loginLink}>
                            <Text color={colors.onPrimary} style={s.loginText}>
                                Already have an account? <Text color={colors.onPrimary} style={s.loginBold}>Sign in</Text>
                            </Text>
                        </Pressable>
                    </ScrollView>
                </KeyboardAvoidingView>
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

        glowTop: { position: "absolute", top: -ms(90), right: -ms(70), width: ms(260), height: ms(260), borderRadius: ms(130), backgroundColor: colors.glass },
        glowLeft: { position: "absolute", top: ms(120), left: -ms(110), width: ms(220), height: ms(220), borderRadius: ms(110), backgroundColor: P.Electric + "38" },
        glowBottom: { position: "absolute", bottom: -ms(120), right: -ms(60), width: ms(300), height: ms(300), borderRadius: ms(150), backgroundColor: P.Violet + "47" },

        scroll: { flexGrow: 1, justifyContent: "center", padding: ms(22) },

        back: { width: ms(40), height: ms(40), borderRadius: ms(20), backgroundColor: colors.glass, alignItems: "center", justifyContent: "center", marginBottom: ms(16) },

        hero: { marginBottom: ms(24) },
        eyebrow: { letterSpacing: 2, textTransform: "uppercase", opacity: 0.75 },
        title: { fontSize: fs(22), marginTop: ms(6), letterSpacing: -1 },
        tagline: { marginTop: ms(8), opacity: 0.8 },

        card: {
            backgroundColor: colors.card,
            borderRadius: ms(28),
            padding: ms(22),
            shadowColor: colors.shadow,
            shadowOpacity: 0.25,
            shadowRadius: 24,
            shadowOffset: { width: 0, height: 12 },
            elevation: 12,
        },

        roleLabel: { marginBottom: ms(6) },
        segmented: { marginBottom: ms(20) },

        errorBox: { backgroundColor: colors.dangerSoft, padding: ms(12), borderRadius: ms(12), marginBottom: ms(14) },

        loginLink: { alignItems: "center", marginTop: ms(24) },
        loginText: { opacity: 0.85 },
        loginBold: { fontWeight: "800", textDecorationLine: "underline", opacity: 1 },
    });