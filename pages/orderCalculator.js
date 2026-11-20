import Layout from '../components/Layout'
import OrderCalculatorTable from '../components/OrderCalculatorTable'
import { useUser } from '../context/userContext'
import useSWR from "swr"
import { useState } from "react";
import {
    calculateCasesToOrder as getCasesToOrder,
    calculateCurrentCaseStock,
    calculateOrderQuantity as getOrderQuantity,
    calculateProjectedStock,
    normalizePackSize,
    toggleSelectedDay,
} from "../lib/orderCalculator.mjs";

const fetcher = (url) => fetch(url).then((response) => response.json());


export default function OrderCalculator() {
    const [selectedBarcodes, setSelectedBarcodes] = useState([]);
    const [searchFilter, setSearchFilter] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [defaultCartFilter, setDefaultCartFilter] = useState(false);
    const [favoriteFilter, setFavoriteFilter] = useState(false)
    const [step, setStep] = useState("select");
    const [calculatorInputs, setCalculatorInputs] = useState({});
    const { user, loadingUser } = useUser();
    const WEEKDAYS = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday"
    ];
    const {
        data: inventory,
        error: inventoryError,
        mutate: refreshInventory,
    } = useSWR("/api/inventory/GetAllItems", fetcher);

    const {
        data: categoryData,
        error: categoryError
    } = useSWR("/api/categories/ListCategories", fetcher);


    if (loadingUser) {
        return (
            <Layout pageName="Order Calculator">
                <p className="m-6">Loading user...</p>
            </Layout>
        );
    }
    if (!user?.authorized) {
        return (
            <Layout pageName="Order Calculator">
                <p className="m-6">
                    Sorry, you are not authorized to view this page.
                </p>
            </Layout>
        );
    }

    if (inventoryError || categoryError) {
        return (
            <Layout pageName="Order Calculator">
                <p className="m-6 text-red-600">
                    Failed to load inventory.
                </p>
            </Layout>
        );
    }
    if (!inventory || !categoryData) {
        return (
            <Layout pageName="Order Calculator">
                <p className="m-6">Loading inventory...</p>
            </Layout>
        );
    }
    const categoryLookup = Object.values(
        categoryData.categories
    ).reduce((lookup, category) => {
        lookup[category.id] = category.displayName;
        return lookup;
    }, {});

    function toggleItem(barcode) {
        setSelectedBarcodes((currentBarcodes) => {
            const isAlreadySelected =
                currentBarcodes.includes(barcode);

            if (isAlreadySelected) {
                return currentBarcodes.filter(
                    (selectedBarcode) => selectedBarcode !== barcode
                );
            }

            return [...currentBarcodes, barcode];
        });
    }
    function updateCalculatorInput(barcode, field, value) {
        setCalculatorInputs((currentInputs) => ({
            ...currentInputs,
            [barcode]: {
                ...currentInputs[barcode],
                [field]: value
            }
        }));
    }

    function toggleCalculatorDay(barcode, day) {
        setCalculatorInputs((currentInputs) => {
            const itemInputs = currentInputs[barcode] || {};
            const selectedDays = itemInputs.days || [];

            const updatedDays = toggleSelectedDay(selectedDays, day);

            return {
                ...currentInputs,
                [barcode]: {
                    ...itemInputs,
                    days: updatedDays
                }
            };
        });
    }
    function calculateOrderQuantity(item) {
        const inputs = calculatorInputs[item.barcode] || {};
        return getOrderQuantity(inputs);
    }

    function calculateCasesToOrder(item, quantityToOrder) {
        return getCasesToOrder(quantityToOrder, item.packSize);
    }

    async function favoriteItem(item) {
        const new_value = !Boolean(item.favorited)
        const response = await fetch("/api/inventory/UpdateItem", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": user.authToken
            },
            body: JSON.stringify({
                barcode: item.barcode,
                favorited: new_value
            })
        }
        )
        const result = await response.json();
        if (!response.ok) {
            console.error(result.error || "Unable to update favorite");
            return;
        }
        refreshInventory(
            {
                ...inventory,
                [item.barcode]: {
                    ...inventory[item.barcode],
                    favorited: new_value
                }
            },
            false
        );
    }

    function reset() {
        setSelectedBarcodes([]);
        setCalculatorInputs({});
    }

    function finishOrder() {
        reset();
        setStep("select");
    }
    const inventoryItems = Object.values(inventory);
    const selectedItems = inventoryItems.filter((item) =>
        selectedBarcodes.includes(item.barcode)
    );

    const orderSummary = selectedItems.map((item) => {
        const inputs = calculatorInputs[item.barcode] || {};
        const days = inputs.days || [];
        const currentStock = Number(item.count) || 0;
        const currentCaseStock = calculateCurrentCaseStock(
            currentStock,
            item.packSize
        );
        const quantityToOrder = calculateOrderQuantity(item);
        const packSize = normalizePackSize(item.packSize);
        const casesToOrder = calculateCasesToOrder(item, quantityToOrder);

        return {
            barcode: item.barcode,
            itemName: item.itemName,
            currentStock,
            currentCaseStock,
            days,
            packSize,
            quantityToOrder,
            casesToOrder,
            newStock: calculateProjectedStock(
                currentStock,
                casesToOrder,
                packSize
            )
        };
    });
    const normalizedSearch = searchFilter.trim().toLowerCase();

    const availableItems = inventoryItems.filter((item) => {
        const isSelected =
            selectedBarcodes.includes(item.barcode);

        const itemName =
            String(item.itemName || "").toLowerCase();

        const barcode =
            String(item.barcode || "").toLowerCase();

        const matchesSearch =
            itemName.includes(normalizedSearch) ||
            barcode.includes(normalizedSearch);

        const itemCategories = Array.isArray(item.categoryName)
            ? item.categoryName
            : [];

        const matchesCategory =
            !categoryFilter ||
            itemCategories.includes(categoryFilter);

        const matchesDefaultCart =
            !defaultCartFilter ||
            Boolean(item.defaultCart);

        const matchesFavorited =
            !favoriteFilter ||
            Boolean(item.favorited);



        return (
            !isSelected &&
            matchesSearch &&
            matchesCategory &&
            matchesDefaultCart &&
            matchesFavorited
        );
    });
    function clearFilters() {
        setSearchFilter("");
        setCategoryFilter("");
        setDefaultCartFilter(false);
        setFavoriteFilter(false);
    }
    const hasActiveFilters =
        searchFilter !== "" ||
        categoryFilter !== "" ||
        defaultCartFilter ||
        favoriteFilter;
    const allItemsHaveDays = orderSummary.every(
        (item) => item.days.length > 0
    );

    if (step === "calculate") {
        return (
            <Layout pageName="Order Calculator">
                <main className="container mx-auto px-6 py-8">
                    <button
                        type="button"
                        onClick={() => setStep("select")}
                        className="btn btn-outline mb-6"
                    >
                        ← Back
                    </button>

                    <h1 className="mb-8 text-4xl font-bold">
                        Order Items
                    </h1>

                    <div className="space-y-6">
                        {selectedItems.map((item) => {
                            const inputs =
                                calculatorInputs[item.barcode] || {};

                            const quantityToOrder =
                                calculateOrderQuantity(item);
                            const casesToOrder =
                                calculateCasesToOrder(item, quantityToOrder);
                            const packSize = normalizePackSize(item.packSize);

                            return (
                                <section
                                    key={item.barcode}
                                    className="rounded-lg border border-gray-100 bg-white p-6 shadow"
                                >
                                    <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                                        <div>
                                            <h2 className="text-2xl font-semibold">
                                                {item.itemName}
                                            </h2>

                                            <p className="text-gray-500">
                                                Current stock (individual units): {item.count}
                                            </p>
                                            <p className="text-gray-500">
                                                Current stock (cases): {calculateCurrentCaseStock(item.count, item.packSize)}
                                            </p>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-pantry-blue-500">
                                                Units to order: {quantityToOrder}
                                            </p>
                                            <p className="text-gray-500">
                                                Cases to order: {casesToOrder} ({packSize} units per case)
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <fieldset>
                                            <legend className="mb-3 font-semibold">
                                                Days to cover
                                            </legend>

                                            <div className="flex flex-wrap gap-x-6 gap-y-3">
                                                {WEEKDAYS.map((day) => {
                                                    const selectedDays = inputs.days || [];
                                                    const isSelected = selectedDays.includes(day);

                                                    return (
                                                        <label
                                                            key={day}
                                                            className="flex cursor-pointer items-center gap-2"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={() =>
                                                                    toggleCalculatorDay(
                                                                        item.barcode,
                                                                        day
                                                                    )
                                                                }
                                                                className="h-5 w-5 rounded border-gray-300 text-pantry-blue-500 focus:ring-pantry-blue-500"
                                                            />

                                                            <span>{day.slice(0, 3)}</span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </fieldset>
                                        <label className="block">
                                            <span className="mb-2 block font-semibold">
                                                Extra quantity in individual units
                                            </span>

                                            <input
                                                type="number"
                                                min="0"
                                                value={inputs.extra || ""}
                                                onChange={(event) =>
                                                    updateCalculatorInput(
                                                        item.barcode,
                                                        "extra",
                                                        event.target.value
                                                    )
                                                }
                                                className="w-full rounded border border-gray-300 px-3 py-2 focus:border-pantry-blue-500 focus:outline-none"
                                                placeholder="Optional"
                                            />
                                        </label>
                                    </div>
                                </section>
                            );
                        })}
                    </div>

                    <section className="mt-12">
                        <h2 className="mb-4 text-2xl font-semibold">
                            Order Summary
                        </h2>

                        <div className="overflow-x-auto rounded-lg shadow">
                            <table className="min-w-full bg-white">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                                            Item name
                                        </th>

                                        <th className="px-5 py-3 text-center text-xs font-semibold uppercase text-gray-500">
                                            Current stock (individual units)
                                        </th>

                                        <th className="px-5 py-3 text-center text-xs font-semibold uppercase text-gray-500">
                                            Current stock (cases)
                                        </th>

                                        <th className="px-5 py-3 text-center text-xs font-semibold uppercase text-gray-500">
                                            Days
                                        </th>

                                        <th className="px-5 py-3 text-center text-xs font-semibold uppercase text-gray-500">
                                            Units to order
                                        </th>

                                        <th className="px-5 py-3 text-center text-xs font-semibold uppercase text-gray-500">
                                            Cases to order
                                        </th>

                                        <th className="px-5 py-3 text-center text-xs font-semibold uppercase text-gray-500">
                                            New stock
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {orderSummary.map((summaryItem) => (
                                        <tr key={summaryItem.barcode}>
                                            <td className="border-t px-5 py-4 font-semibold">
                                                {summaryItem.itemName}
                                            </td>

                                            <td className="border-t px-5 py-4 text-center">
                                                {summaryItem.currentStock}
                                            </td>

                                            <td className="border-t px-5 py-4 text-center">
                                                {summaryItem.currentCaseStock}
                                            </td>

                                            <td className="border-t px-5 py-4 text-center">
                                                {summaryItem.days.length > 0
                                                    ? summaryItem.days
                                                        .map((day) => day.slice(0, 3))
                                                        .join(", ")
                                                    : "None"}
                                            </td>

                                            <td className="border-t px-5 py-4 text-center font-bold">
                                                {summaryItem.quantityToOrder}
                                            </td>

                                            <td className="border-t px-5 py-4 text-center font-bold">
                                                {summaryItem.casesToOrder}
                                                <span className="ml-1 font-normal text-gray-400">
                                                    × {summaryItem.packSize}
                                                </span>
                                            </td>

                                            <td className="border-t px-5 py-4 text-center">
                                                {summaryItem.newStock}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                type="button"
                                onClick={finishOrder}
                                disabled={!allItemsHaveDays}
                                className={
                                    "btn btn-pantry-blue px-10 py-2 font-semibold " +
                                    (!allItemsHaveDays
                                        ? "cursor-not-allowed opacity-50"
                                        : "")
                                }
                            >
                                Done
                            </button>
                        </div>
                    </section>
                </main>
            </Layout>
        );
    }
    return (

        <Layout pageName="Order Calculator">
            <main className="container mx-auto px-6 py-8">
                <h1 className="mb-8 text-4xl font-bold">
                    Order Items
                </h1>


                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold">
                        Items to Order
                    </h2>

                    <button
                        type="button"
                        onClick={reset}
                        disabled={selectedItems.length === 0}
                        className="px-1 py-1 text-sm font-semibold text-red-700 hover:text-red-900 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Reset
                    </button>
                </div>
                {selectedItems.length === 0 ? (
                    <p className="mb-8 text-gray-500">
                        No items selected yet.
                    </p>
                ) : (
                    <OrderCalculatorTable
                        items={selectedItems}
                        selectedBarcodes={selectedBarcodes}
                        onToggleItem={toggleItem}
                        categoryLookup={categoryLookup}
                        onFavorite={favoriteItem}
                    />
                )}

                <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <div>
                            <p className="mb-2 font-semibold">
                                Filter:
                            </p>
                            <label
                                htmlFor="category-filter"
                                className="sr-only"
                            >
                                Filter by category
                            </label>


                            <div className="flex flex-col sm:flex-row">
                                <div className="relative">
                                    <select
                                        value={categoryFilter}
                                        onChange={(event) =>
                                            setCategoryFilter(event.target.value)
                                        }
                                        className="h-full w-full appearance-none rounded border border-gray-300 bg-white px-4 py-2 pr-8 leading-tight text-gray-600 focus:border-gray-400 focus:outline-none sm:w-auto sm:rounded-r-none"
                                    >
                                        <option value="">
                                            All Categories
                                        </option>

                                        {Object.values(categoryData.categories).map(
                                            (category) => (
                                                <option
                                                    key={category.id}
                                                    value={category.id}
                                                >
                                                    {category.displayName}
                                                </option>
                                            )
                                        )}
                                    </select>

                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-600">
                                        <svg
                                            className="h-4 w-4 fill-current"
                                            viewBox="0 0 20 20"
                                            aria-hidden="true"
                                        >
                                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                        </svg>
                                    </div>
                                </div>

                                <div className="relative">
                                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2">
                                        <svg
                                            viewBox="0 0 24 24"
                                            aria-hidden="true"
                                            className="h-4 w-4 fill-current text-gray-400"
                                        >
                                            <path d="M10 4a6 6 0 100 12 6 6 0 000-12zm-8 6a8 8 0 1114.32 4.906l5.387 5.387a1 1 0 01-1.414 1.414l-5.387-5.387A8 8 0 012 10z" />
                                        </svg>
                                    </span>

                                    <input
                                        id="inventory-search"
                                        type="search"
                                        value={searchFilter}
                                        onChange={(event) =>
                                            setSearchFilter(event.target.value)
                                        }
                                        placeholder="Search name or barcode"
                                        className="block w-full appearance-none rounded border border-gray-300 bg-white py-2 pl-8 pr-6 text-sm text-gray-600 placeholder-gray-300 focus:outline-none sm:w-64 sm:rounded-l-none"
                                    />
                                </div>

                                {hasActiveFilters && (
                                    <button
                                        type="button"
                                        onClick={clearFilters}
                                        className="mt-2 text-left text-gray-500 sm:ml-3 sm:mt-0"
                                    >
                                        clear filters
                                    </button>
                                )}
                            </div>
                            <div className="mt-3 flex items-center gap-6">
                                <label className="mt-3 flex items-center text-gray-600">
                                    <input
                                        type="checkbox"
                                        checked={defaultCartFilter}
                                        onChange={(event) =>
                                            setDefaultCartFilter(event.target.checked)
                                        }
                                        className="mr-2 h-4 w-4"
                                    />

                                    Show Default Cart Items
                                </label>
                                <label className="mt-3 flex items-center text-gray-600">
                                    <input
                                        type="checkbox"
                                        checked={favoriteFilter}
                                        onChange={(event) =>
                                            setFavoriteFilter(event.target.checked)
                                        }
                                        className="mr-2 h-4 w-4"
                                    />

                                    Favorited
                                </label>
                            </div>
                        </div>



                    </div>


                    <button
                        type="button"
                        disabled={selectedItems.length === 0}
                        onClick={() => setStep("calculate")}
                        className={
                            "btn btn-pantry-blue px-6 py-2 font-semibold " +
                            (selectedItems.length === 0
                                ? "cursor-not-allowed opacity-50"
                                : "")
                        }
                    >
                        Proceed to ordering →
                    </button>
                </div>


                <h2 className="mb-4 text-xl font-semibold">
                    Inventory
                </h2>

                <OrderCalculatorTable
                    items={availableItems}
                    selectedBarcodes={selectedBarcodes}
                    onToggleItem={toggleItem}
                    categoryLookup={categoryLookup}
                    onFavorite={favoriteItem}
                />

            </main>
        </Layout >
    )

}
