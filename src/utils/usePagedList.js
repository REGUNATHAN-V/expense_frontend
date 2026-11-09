import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";

// Infinite-scroll helper for the backend's ?index=&limit= paging.
// Pages are stored by index, so a refetch of one page replaces it instead of duplicating rows.
// Must be used inside a navigation screen (it re-syncs when the screen regains focus).
export default function usePagedList(useQueryHook, params = {}, limit = 20) {
    const key = JSON.stringify(params);
    const [index, setIndex] = useState(1);
    const [pages, setPages] = useState({});
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        setIndex(1);
        setPages({});
    }, [key]);

    const q = useQueryHook({ ...params, index, limit });
    const current = q.currentData;

    useEffect(() => {
        if (current) setPages((p) => ({ ...p, [current.pagination?.index ?? index]: current.items }));
    }, [current, q.isFetching]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!q.isFetching) setRefreshing(false);
    }, [q.isFetching]);

    const items = useMemo(
        () => Object.keys(pages).map(Number).sort((a, b) => a - b).flatMap((k) => pages[k]),
        [pages]
    );

    const hasNext = !!current?.pagination?.hasNext;

    const loadMore = useCallback(() => {
        if (hasNext && !q.isFetching) setIndex((i) => i + 1);
    }, [hasNext, q.isFetching]);

    // Refresh keeps what is on screen (no blank flash). Only the extra pages are dropped;
    // page 1 is replaced as soon as the fresh data arrives.
    const refresh = useCallback(() => {
        setPages((p) => (p[1] ? { 1: p[1] } : {}));
        if (index === 1) q.refetch();
        else setIndex(1);
    }, [index, q.refetch]); // eslint-disable-line react-hooks/exhaustive-deps

    const pullRefresh = useCallback(() => {
        setRefreshing(true);
        refresh();
    }, [refresh]);

    // Refresh when returning to this screen (e.g. after approving / editing a claim).
    const refreshRef = useRef(refresh);
    refreshRef.current = refresh;
    const first = useRef(true);
    useFocusEffect(
        useCallback(() => {
            if (first.current) {
                first.current = false;
                return;
            }
            refreshRef.current();
        }, [])
    );

    return {
        items,
        loadMore,
        refresh,
        pullRefresh,
        refreshing,
        hasNext,
        error: q.error,
        isLoading: q.isFetching && items.length === 0 && !refreshing && !q.currentData,
        isLoadingMore: q.isFetching && items.length > 0 && !refreshing,
    };
}
