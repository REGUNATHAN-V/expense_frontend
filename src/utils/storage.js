import * as Keychain from "react-native-keychain";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SESSION_SERVICE = "expense.session";
const SETTINGS_KEY = "expense.settings";

// The token lives in the iOS Keychain / Android Keystore, never in plain AsyncStorage.
export async function loadSession() {
    try {
        const creds = await Keychain.getGenericPassword({ service: SESSION_SERVICE });
        return creds ? JSON.parse(creds.password) : null;
    } catch {
        return null;
    }
}
export async function saveSession(session) {
    try {
        if (session) {
            await Keychain.setGenericPassword("session", JSON.stringify(session), { service: SESSION_SERVICE });
        } else {
            await Keychain.resetGenericPassword({ service: SESSION_SERVICE });
        }
    } catch {}
}
export async function loadSettings() {
    try {
        const raw = await AsyncStorage.getItem(SETTINGS_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}
export async function saveSettings(settings) {
    try {
        await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {}
}
