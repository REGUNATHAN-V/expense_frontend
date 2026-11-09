// Icon for an expense category (falls back to a price tag for custom ones).
export const categoryIcon = (name = "") => {
    const n = name.toLowerCase();
    if (n.includes("taxi") || n.includes("cab") || n.includes("travel")) return "car-sport-outline";
    if (n.includes("meal") || n.includes("food") || n.includes("lunch")) return "restaurant-outline";
    if (n.includes("park")) return "business-outline";
    if (n.includes("fuel") || n.includes("petrol")) return "flame-outline";
    if (n.includes("accom") || n.includes("hotel") || n.includes("stay")) return "bed-outline";
    return "pricetag-outline";
};
