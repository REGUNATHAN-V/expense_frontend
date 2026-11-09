import { createSlice } from "@reduxjs/toolkit";

export const ROLES = { 1: "Maker", 2: "Approver", 3: "Admin" };

const initialState = {
    token: null,
    user: null, 
    hydrated: false, 
    locked: false, 
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        hydrate: (state, { payload }) => {
            state.token = payload?.token ?? null;
            state.user = payload?.user ?? null;
            state.locked = !!(payload?.token && payload?.lock);
            state.hydrated = true;
        },
        setCredentials: (state, { payload }) => {
            const { token, ...user } = payload;
            state.token = token;
            state.user = user;
            state.locked = false;
        },
        logout: (state) => {
            state.token = null;
            state.user = null;
            state.locked = false;
        },
        lock: (state) => {
            if (state.token) state.locked = true;
        },
        unlock: (state) => {
            state.locked = false;
        },
    },
});

export const { hydrate, setCredentials, logout, lock, unlock } = authSlice.actions;
export default authSlice.reducer;
