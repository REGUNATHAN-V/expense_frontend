import React from "react";
import { View, ActivityIndicator } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useTheme } from "../theme/theme";
import Text from "./Text";
import Button from "./Button";
import { ms } from "../theme/scale";

export function Loader({ style }) {
    const { colors } = useTheme();
    return (
        <View style={[{ flex: 1, alignItems: "center", justifyContent: "center", padding: ms(32) }, style]}>
            <ActivityIndicator size="large" color={colors.primary} />
        </View>
    );
}

export function EmptyState({ icon = "file-tray-outline", title, message, action, onAction }) {
    const { colors } = useTheme();
    return (
        <View style={{ alignItems: "center", padding: ms(32), gap: ms(8) }}>
            <View style={{ width: ms(72), height: ms(72), borderRadius: ms(36), backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" }}>
                <Ionicons name={icon} size={ms(32)} color={colors.primary} />
            </View>
            <Text variant="h3" style={{ marginTop: ms(8) }}>
                {title}
            </Text>
            {message ? (
                <Text sub style={{ textAlign: "center" }}>
                    {message}
                </Text>
            ) : null}
            {action ? <Button title={action} onPress={onAction} small style={{ marginTop: ms(8) }} /> : null}
        </View>
    );
}

export function ErrorState({ message, onRetry }) {
    return <EmptyState icon="cloud-offline-outline" title="Couldn't load" message={message} action="Try again" onAction={onRetry} />;
}

export function FooterLoader({ show }) {
    const { colors } = useTheme();
    return show ? <ActivityIndicator style={{ marginVertical: ms(16) }} color={colors.primary} /> : <View style={{ height: ms(16) }} />;
}
