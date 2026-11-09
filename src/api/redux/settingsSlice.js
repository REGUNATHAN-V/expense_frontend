import { createSlice } from "@reduxjs/toolkit";

const settingsSlice = createSlice({
    name: "settings",
    initialState: {
        themeMode: "system",
        biometricEnabled: false,
    },
    reducers: {
        hydrateSettings: (state, { payload }) => ({ ...state, ...(payload || {}) }),
        setThemeMode: (state, { payload }) => {
            state.themeMode = payload;
        },
        setBiometricEnabled: (state, { payload }) => {
            state.biometricEnabled = payload;
        },
    },
});

export const { hydrateSettings, setThemeMode, setBiometricEnabled } = settingsSlice.actions;
export default settingsSlice.reducer;
