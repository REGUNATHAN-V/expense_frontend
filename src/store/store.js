import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "../api/apiSlice";
import authReducer from "../api/redux/authSlice";
import settingsReducer from "../api/redux/settingsSlice";
import { saveSession, saveSettings } from "../utils/storage";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        settings: settingsReducer,
        [apiSlice.reducerPath]: apiSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(apiSlice.middleware),
});

// Persist session + settings whenever they change (after the first hydrate).
let prevAuth;
let prevSettings;
store.subscribe(() => {
    const { auth, settings } = store.getState();
    if (!auth.hydrated) return;

    if (auth.token !== prevAuth?.token || auth.user !== prevAuth?.user) {
        saveSession(auth.token ? { token: auth.token, user: auth.user } : null);
    }
    if (settings !== prevSettings) saveSettings(settings);

    prevAuth = auth;
    prevSettings = settings;
});
