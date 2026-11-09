import environment from "../environment/Environment";

export const money = (n) =>
    `${environment.CURRENCY}${Number(n || 0).toLocaleString(environment.LOCALE, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const pad = (n) => String(n).padStart(2, "0");

// Date -> "2026-11-06" (local time, what the API's DateOnly expects)
export const toISODate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// "2026-11-06" -> Date (local, no timezone drift)
export const fromISODate = (s) => {
    if (!s) return new Date();
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, m - 1, d);
};

export const fmtDate = (s) => {
    if (!s) return "—";
    const [y, m, d] = s.split("-").map(Number);
    return `${pad(d)} ${MONTHS[m - 1]} ${y}`;
};

// "2026-11" -> "November 2026"
export const fmtMonth = (s) => {
    if (!s) return "—";
    const [y, m] = s.split("-").map(Number);
    return `${MONTHS_LONG[m - 1]} ${y}`;
};

// "2026-11" -> { from: "2026-11-01", to: "2026-11-30" } (for the API's date filters)
export const monthRange = (month) => {
    if (!month) return {};
    const [y, m] = month.split("-").map(Number);
    const last = new Date(y, m, 0).getDate();
    return { from: `${y}-${pad(m)}-01`, to: `${y}-${pad(m)}-${pad(last)}` };
};

// Drops empty filters (null, "", "All") so they are not sent to the API.
export const cleanParams = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v != null && v !== "" && v !== "All"));

export const initials = (name = "") =>
    name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";

// Turns an RTK Query error into a readable message.
export const errMsg = (error) => {
    if (!error) return "";
    if (error.data?.error) return error.data.error;
    if (error.data?.title) return error.data.title;
    if (error.status === "FETCH_ERROR") return "Cannot reach the server. Check your connection and API URL.";
    if (error.status === "TIMEOUT_ERROR") return "The server took too long to respond.";
    if (error.status === 403) return "You don't have permission to do that.";
    return "Something went wrong. Please try again.";
};
