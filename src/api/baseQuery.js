import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import environment from "../environment/Environment";

const excludedEndpoints = ["register", "login"];

const rawBaseQuery = fetchBaseQuery({
    baseUrl: environment.BASE_URL,
    timeout: 20000,

    prepareHeaders: (headers, { getState, endpoint }) => {
        headers.set("Content-Type", "application/json");

        if (!excludedEndpoints.includes(endpoint)) {
            const token = getState()?.auth?.token;
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
        }
        return headers;
    },
});

export default rawBaseQuery;
