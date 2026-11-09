import React, { useMemo, useState } from "react";
import { View, ScrollView, Pressable, StyleSheet, useWindowDimensions } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useTheme } from "../theme/theme";
import { ms, fs } from "../theme/scale";
import Text from "./Text";
import Input from "./Input";
import Sheet from "./Sheet";
import Avatar from "./Avatar";
import { useGetCategoriesQuery, useGetEmployeesQuery } from "../api/apiSlice";
import { categoryIcon } from "../utils/categoryIcon";

function FilterPill({ icon, label, active, onPress }) {
    const { colors } = useTheme();
    const { width } = useWindowDimensions();
    const tint = active ? colors.primary : colors.sub;

    return (
        <Pressable
            onPress={onPress}
            style={{
                height: ms(34),
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: ms(11),
                borderRadius: 999,
                backgroundColor: active ? colors.primarySoft : colors.card,
                borderWidth: StyleSheet.hairlineWidth * 2,
                borderColor: active ? colors.primary : colors.border,
            }}
        >
            <Ionicons name={icon} size={ms(14)} color={tint} />
            <Text
                variant="label"
                numberOfLines={1}
                color={tint}
                style={{
                    fontSize: fs(12),
                    fontWeight: active ? "800" : "600",
                    marginHorizontal: ms(5),
                    maxWidth: width * 0.36,
                }}
            >
                {label}
            </Text>
            <Ionicons name="chevron-down" size={ms(13)} color={tint} />
        </Pressable>
    );
}

function PickerSheet({ visible, title, allLabel, options, value, onPick, onClose, searchable }) {
    const { colors } = useTheme();
    const { height } = useWindowDimensions();
    const [search, setSearch] = useState("");
    const shown = useMemo(() => {
        const s = search.trim().toLowerCase();
        return s ? options.filter((o) => o.label.toLowerCase().includes(s)) : options;
    }, [options, search]);

    const pick = (v) => {
        setSearch("");
        onPick(v);
        onClose();
    };

    return (
        <Sheet visible={visible} onClose={onClose} title={title}>
            {searchable ? <Input icon="search-outline" placeholder="Search" value={search} onChangeText={setSearch} autoCapitalize="none" style={{ marginBottom: ms(8) }} /> : null}
            <ScrollView
                style={{ maxHeight: height * 0.55 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {[{ value: null, label: allLabel }, ...shown].map((o) => {
                    const active = (o.value ?? null) === (value ?? null);
                    return (
                        <Pressable
                            key={String(o.value)}
                            onPress={() => pick(o.value)}
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                paddingVertical: ms(12),
                                borderBottomWidth: StyleSheet.hairlineWidth * 2,
                                borderBottomColor: colors.border,
                            }}
                        >
                            {o.render ? o.render() : null}
                            <Text variant="h3" color={active ? colors.primary : colors.text} style={{ flex: 1, fontSize: fs(14) }}>
                                {o.label}
                            </Text>
                            {/* {active ? <Ionicons name="checkmark-circle" size={ms(20)} color={colors.primary} /> : null} */}
                        </Pressable>
                    );
                })}
                {shown.length === 0 ? (
                    <Text sub style={{ textAlign: "center", paddingVertical: ms(16) }}>
                        Nothing found.
                    </Text>
                ) : null}
            </ScrollView>
        </Sheet>
    );
}

export default function FilterBar({ showCategory = true, showEmployee = false, categoryId, onCategoryChange, employeeId, onEmployeeChange, style }) {
    const { colors } = useTheme();
    const [open, setOpen] = useState(null);

    const { data: categories = [] } = useGetCategoriesQuery(undefined, { skip: !showCategory });
    const { data: employees = [] } = useGetEmployeesQuery(undefined, { skip: !showEmployee });

    const categoryOptions = useMemo(
        () =>
            categories.map((c) => ({
                value: c.id,
                label: c.name,
                render: () => <Ionicons name={categoryIcon(c.name)} size={ms(18)} color={colors.backgroundColor} style={{ marginRight: ms(11) }} />,
            })),
        [categories, colors.primary]
    );
    const employeeOptions = useMemo(
        () =>
            employees.map((e) => ({
                value: e.id,
                label: e.name,
                render: () => (
                    <View style={{ marginRight: ms(11) }}>
                        {/* <Avatar name={e.name} size={ms(28)} /> */}
                    </View>
                ),
            })),
        [employees]
    );

    const category = categories.find((c) => c.id === categoryId);
    const employee = employees.find((e) => e.id === employeeId);
    const anyActive = (showCategory && categoryId != null) || (showEmployee && employeeId != null);

    const clear = () => {
        if (showCategory) onCategoryChange?.(null);
        if (showEmployee) onEmployeeChange?.(null);
    };

    return (
        <View style={style}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={{ alignItems: "center", paddingHorizontal: ms(16) }}>
                {showCategory ? (
                    <View style={{ marginRight: ms(8) }}>
                        <FilterPill icon="pricetag-outline" label={category?.name ?? "Category"} active={categoryId != null} onPress={() => setOpen("category")} />
                    </View>
                ) : null}
                {showEmployee ? (
                    <View style={{ marginRight: ms(8) }}>
                        <FilterPill icon="person-outline" label={employee?.name ?? "Employee"} active={employeeId != null} onPress={() => setOpen("employee")} />
                    </View>
                ) : null}
                {anyActive ? (
                    <Pressable onPress={clear} hitSlop={8} style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: ms(6) }}>
                        <Ionicons name="close-circle" size={ms(15)} color={colors.danger} />
                        <Text variant="label" color={colors.danger} style={{ marginLeft: ms(4), fontSize: fs(12) }}>
                            Clear
                        </Text>
                    </Pressable>
                ) : null}
            </ScrollView>

            <PickerSheet visible={open === "category"} title="Filter by category" allLabel="All categories" options={categoryOptions} value={categoryId} onPick={(v) => onCategoryChange?.(v)} onClose={() => setOpen(null)} />
            <PickerSheet visible={open === "employee"} title="Filter by employee" allLabel="All employees" options={employeeOptions} value={employeeId} onPick={(v) => onEmployeeChange?.(v)} onClose={() => setOpen(null)} searchable={employeeOptions.length > 8} />
        </View>
    );
}