import { createNavigationContainerRef } from "@react-navigation/native";

export const navigationRef = createNavigationContainerRef();

export const goToTab = (screen) => {
    if (navigationRef.isReady()) navigationRef.navigate("Main", { screen });
};

export const goTo = (name, params) => {
    if (navigationRef.isReady()) navigationRef.navigate(name, params);
};
