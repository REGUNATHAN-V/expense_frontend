import React from "react";
import { Modal, View, Pressable } from "react-native";
import { useTheme } from "../theme/theme";
import Text from "./Text";
import { ms } from "../theme/scale";

export default function Sheet({ visible, onClose, title, children }) {
    const { colors } = useTheme();
    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <Pressable style={{ flex: 1, backgroundColor: colors.overlay }} onPress={onClose} />
            <View
                style={{
                    backgroundColor: colors.card,
                    borderTopLeftRadius: ms(24),
                    borderTopRightRadius: ms(24),
                    padding: ms(20),
                    paddingBottom: ms(36),
                    maxHeight: "75%",
                }}
            >
                <View style={{ alignSelf: "center", width: ms(40), height: ms(4), borderRadius: ms(2), backgroundColor: colors.border, marginBottom: ms(14) }} />
                {title ? (
                    <Text variant="h2" style={{ marginBottom: ms(12) }}>
                        {title}
                    </Text>
                ) : null}
                {children}
            </View>
        </Modal>
    );
}
