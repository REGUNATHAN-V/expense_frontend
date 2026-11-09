import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

const DrawerContext = createContext({ open: () => {}, close: () => {}, isOpen: false, active: null, setActive: () => {} });

export function DrawerProvider({ children }) {
    const [isOpen, setOpen] = useState(false);
    const [active, setActive] = useState(null);
    const open = useCallback(() => setOpen(true), []);
    const close = useCallback(() => setOpen(false), []);
    const value = useMemo(() => ({ isOpen, open, close, active, setActive }), [isOpen, open, close, active]);
    return <DrawerContext.Provider value={value}>{children}</DrawerContext.Provider>;
}

export const useDrawer = () => useContext(DrawerContext);
