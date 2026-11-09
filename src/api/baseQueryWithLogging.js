import rawBaseQuery from "./baseQuery";
import { logout } from "./redux/authSlice";

const baseQueryWithLogging = async (args, api, extraOptions) => {
    const url = typeof args === "string" ? args : args.url;
    const method = typeof args === "string" ? "GET" : args.method || "GET";

    const result = await rawBaseQuery(args, api, extraOptions);

    if (__DEV__) {
        if (result.error) {
            console.log(`[API] ${method} ${url} ✖`, result.error.status, result.error.data);
        } else {
            console.log(`[API] ${method} ${url} ✔`);
        }
    }

    const isAuthCall = api.endpoint === "login" || api.endpoint === "register";
    if (result.error?.status === 401 && !isAuthCall) {
        api.dispatch(logout());
    }

    return result;
};

export default baseQueryWithLogging;
