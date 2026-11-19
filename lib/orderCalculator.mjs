export const ESTIMATED_USAGE_PER_DAY = 100;

export function toggleSelectedDay(selectedDays = [], day) {
    return selectedDays.includes(day)
        ? selectedDays.filter((selectedDay) => selectedDay !== day)
        : [...selectedDays, day];
}

export function calculateOrderQuantity(
    inputs = {},
    estimatedUsagePerDay = ESTIMATED_USAGE_PER_DAY
) {
    const selectedDays = Array.isArray(inputs.days) ? inputs.days : [];
    const parsedExtra = Number(inputs.extra);
    const extra = Number.isFinite(parsedExtra) ? parsedExtra : 0;
    const parsedDailyUsage = Number(estimatedUsagePerDay);
    const dailyUsage = Number.isFinite(parsedDailyUsage)
        ? parsedDailyUsage
        : 0;

    return Math.max(0, selectedDays.length * dailyUsage + extra);
}

export function normalizePackSize(packSize) {
    const parsedPackSize = Number(packSize);
    return parsedPackSize > 0 ? parsedPackSize : 1;
}

export function calculateCasesToOrder(quantityToOrder, packSize) {
    const parsedQuantity = Number(quantityToOrder);
    const quantity = Number.isFinite(parsedQuantity)
        ? Math.max(0, parsedQuantity)
        : 0;

    return Math.ceil(quantity / normalizePackSize(packSize));
}

export function calculateProjectedStock(
    currentStock,
    casesToOrder,
    packSize
) {
    const parsedStock = Number(currentStock);
    const stock = Number.isFinite(parsedStock) ? parsedStock : 0;
    const parsedCases = Number(casesToOrder);
    const cases = Number.isFinite(parsedCases)
        ? Math.max(0, parsedCases)
        : 0;

    return stock + cases * normalizePackSize(packSize);
}
