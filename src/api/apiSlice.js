import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithLogging from "./baseQueryWithLogging";

const unwrap = (r) => r?.data;
const paged = (r) => ({ items: r?.data ?? [], pagination: r?.pagination });

export const apiSlice = createApi({
    reducerPath: "api",
    baseQuery: baseQueryWithLogging,
    tagTypes: ["Claim", "User", "Report", "Category"],

    endpoints: (builder) => ({
        // ---------- Auth ----------
        register: builder.mutation({
            query: (body) => ({ url: "Auth/register", method: "POST", body }),
            transformResponse: unwrap,
        }),
        login: builder.mutation({
            query: (body) => ({ url: "Auth/login", method: "POST", body }),
            transformResponse: unwrap,
        }),

        // ---------- Categories ----------
        getCategories: builder.query({
            query: () => "categories",
            transformResponse: unwrap,
            providesTags: ["Category"],
        }),

        // ---------- Employees (approver + admin filter picker) ----------
        getEmployees: builder.query({
            query: () => "lookup/employees",
            transformResponse: unwrap,
            providesTags: ["User"],
        }),

        // ---------- Maker ----------
        getMyClaims: builder.query({
            query: (params) => ({ url: "maker/claims", params }),
            transformResponse: paged,
            providesTags: ["Claim"],
        }),
        getMyClaim: builder.query({
            query: (id) => `maker/claims/${id}`,
            transformResponse: unwrap,
            providesTags: (r, e, id) => [{ type: "Claim", id }],
        }),
        getMyMonthlyTotals: builder.query({
            query: (params) => ({ url: "maker/claims/monthly-totals", params }),
            transformResponse: paged,
            providesTags: ["Claim", "Report"],
        }),
        getMyCategoryItems: builder.query({
            query: (params) => ({ url: "maker/claims/items", params }),
            transformResponse: paged,
            providesTags: ["Claim", "Report"],
        }),
        createClaim: builder.mutation({
            query: (body) => ({ url: "maker/claims", method: "POST", body }),
            transformResponse: unwrap,
            invalidatesTags: ["Claim", "Report"],
        }),
        updateClaim: builder.mutation({
            query: ({ id, ...body }) => ({ url: `maker/claims/${id}`, method: "PUT", body }),
            transformResponse: unwrap,
            invalidatesTags: ["Claim", "Report"],
        }),
        cancelClaim: builder.mutation({
            query: (id) => ({ url: `maker/claims/${id}/cancel`, method: "POST" }),
            transformResponse: unwrap,
            invalidatesTags: ["Claim", "Report"],
        }),

        // ---------- Approver ----------
        getApproverClaims: builder.query({
            query: (params) => ({ url: "approver/claims", params }),
            transformResponse: paged,
            providesTags: ["Claim"],
        }),
        getApproverClaim: builder.query({
            query: (id) => `approver/claims/${id}`,
            transformResponse: unwrap,
            providesTags: (r, e, id) => [{ type: "Claim", id }],
        }),
        decideClaim: builder.mutation({
            query: ({ id, action }) => ({ url: `approver/claims/${id}/${action}`, method: "POST" }),
            transformResponse: unwrap,
            invalidatesTags: ["Claim", "Report"],
        }),

        // ---------- Admin: claim detail (read-only) ----------
        getAdminClaim: builder.query({
            query: (id) => `admin/claims/${id}`,
            transformResponse: unwrap,
            providesTags: (r, e, id) => [{ type: "Claim", id }],
        }),

        // ---------- Admin: users ----------
        getUsers: builder.query({
            query: (params) => ({ url: "admin/users", params }),
            transformResponse: paged,
            providesTags: ["User"],
        }),
        updateUserRole: builder.mutation({
            query: ({ id, role }) => ({ url: `admin/users/${id}/role`, method: "PUT", body: { role } }),
            invalidatesTags: ["User"],
        }),
        setUserActive: builder.mutation({
            query: ({ id, isActive }) => ({ url: `admin/users/${id}/active`, method: "PUT", body: { isActive } }),
            invalidatesTags: ["User"],
        }),

        // ---------- Admin: reports ----------
        getMonthlyTotals: builder.query({
            query: (params) => ({ url: "admin/reports/monthly-totals", params }),
            transformResponse: paged,
            providesTags: ["Report"],
        }),
        // Items behind a monthly total (employee + month + category)
        getAdminCategoryItems: builder.query({
            query: (params) => ({ url: "admin/reports/items", params }),
            transformResponse: paged,
            providesTags: ["Claim", "Report"],
        }),
        getTopCategories: builder.query({
            query: (params) => ({ url: "admin/reports/top-categories", params }),
            transformResponse: unwrap,
            providesTags: ["Report"],
        }),
        getMismatchedClaims: builder.query({
            query: (params) => ({ url: "admin/reports/mismatched-claims", params }),
            transformResponse: paged,
            providesTags: ["Report"],
        }),
        getLatestClaims: builder.query({
            query: (params) => ({ url: "admin/reports/latest-claims", params }),
            transformResponse: paged,
            providesTags: ["Report"],
        }),
    }),
});

export const {
    useRegisterMutation,
    useLoginMutation,
    useGetCategoriesQuery,
    useGetEmployeesQuery,
    useGetMyClaimsQuery,
    useGetMyCategoryItemsQuery,
    useGetMyClaimQuery,
    useGetMyMonthlyTotalsQuery,
    useCreateClaimMutation,
    useUpdateClaimMutation,
    useCancelClaimMutation,
    useGetApproverClaimsQuery,
    useGetApproverClaimQuery,
    useDecideClaimMutation,
    useGetAdminClaimQuery,
    useGetUsersQuery,
    useUpdateUserRoleMutation,
    useSetUserActiveMutation,
    useGetMonthlyTotalsQuery,
    useGetAdminCategoryItemsQuery,
    useGetTopCategoriesQuery,
    useGetMismatchedClaimsQuery,
    useGetLatestClaimsQuery,
} = apiSlice;
