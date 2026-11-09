import ReactNativeBiometrics from "react-native-biometrics";

const rnBiometrics = new ReactNativeBiometrics({ allowDeviceCredentials: true });

export async function biometricsAvailable() {
    try {
        const { available } = await rnBiometrics.isSensorAvailable();
        return !!available;
    } catch {
        return false;
    }
}

export async function authenticate(reason = "Unlock Expense Claim") {
    try {
        const { success } = await rnBiometrics.simplePrompt({ promptMessage: reason, cancelButtonText: "Cancel" });
        return !!success;
    } catch {
        return false;
    }
}
