import test from "node:test";
import assert from "node:assert/strict";

import {
    calculateCasesToOrder,
    calculateOrderQuantity,
    calculateProjectedStock,
    normalizePackSize,
    toggleSelectedDay,
} from "../lib/orderCalculator.mjs";

test("selecting a weekday adds it without changing the original array", () => {
    const original = ["Monday"];
    const result = toggleSelectedDay(original, "Tuesday");

    assert.deepEqual(result, ["Monday", "Tuesday"]);
    assert.deepEqual(original, ["Monday"]);
});

test("selecting an existing weekday removes it", () => {
    assert.deepEqual(
        toggleSelectedDay(["Monday", "Tuesday"], "Monday"),
        ["Tuesday"]
    );
});

test("order quantity increases for every selected weekday", () => {
    assert.equal(calculateOrderQuantity({ days: ["Monday"] }), 100);
    assert.equal(
        calculateOrderQuantity({ days: ["Monday", "Tuesday", "Friday"] }),
        300
    );
});

test("current stock does not reduce the requested order quantity", () => {
    const inputs = { days: ["Monday", "Tuesday"], extra: 0 };

    assert.equal(calculateOrderQuantity(inputs), 200);
});

test("extra units are added to weekday demand", () => {
    assert.equal(
        calculateOrderQuantity({ days: ["Monday", "Tuesday"], extra: "25" }),
        225
    );
});

test("invalid extra quantities do not break the calculation", () => {
    assert.equal(
        calculateOrderQuantity({ days: ["Monday"], extra: "not-a-number" }),
        100
    );
});

test("cases to order round up to a whole case", () => {
    assert.equal(calculateCasesToOrder(25, 12), 3);
    assert.equal(calculateCasesToOrder(24, 12), 2);
    assert.equal(calculateCasesToOrder(0, 12), 0);
});

test("missing or invalid pack sizes safely default to one", () => {
    assert.equal(normalizePackSize(undefined), 1);
    assert.equal(normalizePackSize(0), 1);
    assert.equal(normalizePackSize("12"), 12);
});

test("projected stock includes every unit in the ordered cases", () => {
    assert.equal(calculateProjectedStock(50, 3, 12), 86);
});
