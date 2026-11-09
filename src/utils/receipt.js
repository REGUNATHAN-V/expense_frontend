

const normalizeAmount = (value) =>
    Number(value.replace(/,/g, ""));

const parseReceiptDate = (text) => {
    const match = text.match(
        /\b(\d{4}[-/]\d{2}[-/]\d{2}|\d{2}[-/]\d{2}[-/]\d{4})\b/
    );

    if (!match) return null;

    const value = match[0];

    let year, month, day;

    if (value.startsWith("20")) {
        [year, month, day] = value.split(/[-/]/);
    } else {
        [day, month, year] = value.split(/[-/]/);
    }

    const date = new Date(
        Number(year),
        Number(month) - 1,
        Number(day)
    );

    if (
        date.getFullYear() !== Number(year) ||
        date.getMonth() !== Number(month) - 1 ||
        date.getDate() !== Number(day)
    ) return null;

    return `${year}-${month}-${day}`;
};

const detectCategory = (text, categories) => {
    const value = text.toLowerCase();

    const keywords = {
        taxi: ["taxi", "ola", "uber", "cab", "ride", "fare"],
        meals: ["restaurant", "food", "meals", "cafe", "hotel food"],
        parking: ["parking", "park fee", "parking fee"],
        fuel: ["petrol", "diesel", "fuel", "bharat petroleum", "indian oil"],
        accommodation: ["accommodation", "lodging", "hotel stay", "room rent"],
    };

    for (const category of categories) {
        const name = category.name.toLowerCase();

        const matchedKeywords = keywords[name] || [name];

        if (matchedKeywords.some((word) => value.includes(word))) {
            return category.id;
        }
    }

    return null;
};

const detectAmount = (text) => {
    const lines = text
        .split(/\n/)
        .map(line => line.trim())
        .filter(Boolean);

    const amountRegex =
        /(?:₹|rs\.?|inr)?\s*(\d[\d,]*(?:\.\d{1,2})?)/gi;

    const amounts = [];

    lines.forEach((line, index) => {
        const matches = [...line.matchAll(amountRegex)];

        matches.forEach(match => {
            const amount = Number(match[1].replace(/,/g, ""));

            if (amount > 0) {
                amounts.push({
                    amount,
                    line,
                    index,
                });
            }
        });
    });

    const totalKeywords =
        /grand\s*total|total\s*paid|amount\s*paid|net\s*payable|total\s*payable|bill\s*total/i;

    const totalIndex = lines.findIndex(line =>
        totalKeywords.test(line)
    );

    if (totalIndex !== -1) {
        // Look for total amount after the total label.
        const nextAmounts = amounts.filter(item =>
            item.index > totalIndex
        );

        if (nextAmounts.length) {
            return String(nextAmounts[nextAmounts.length - 1].amount);
        }
    }

    return "";
};

const detectDescription = (text) => {
    const lines = text
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 2);

    const ignored = /^(invoice|receipt|bill|tax invoice|date|time|gst|thank you)/i;

    return lines.find((line) =>
        !ignored.test(line) &&
        !/\d{5,}/.test(line) &&
        !/^[₹\d.,\s]+$/.test(line)
    )?.slice(0, 200) || "";
};

export const parseReceiptText = (text, categories) => ({
    categoryId: detectCategory(text, categories),
    amount: detectAmount(text),
    expenseDate: parseReceiptDate(text) || "",
    description: detectDescription(text),
});