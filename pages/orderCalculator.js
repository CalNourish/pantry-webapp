import Layout from '../components/Layout'
import OrderCalculatorTable from '../components/OrderCalculatorTable'
import { useUser } from '../context/userContext'
import useSWR from "swr"
import { useState } from "react";

const fetcher = (url) => fetch(url).then((response) => response.json());


export default function OrderCalculator() {
    const [selectedBarcodes, setSelectedBarcodes] = useState([]);
    const [searchFilter, setSearchFilter] = useState("");
    const [step, setStep] = useState("select");
    const { user, loadingUser } = useUser();

    const {
        data: inventory,
        error: inventoryError
    } = useSWR("/api/inventory/GetAllItems", fetcher);

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

    if (inventoryError) {
        return (
            <Layout pageName="Order Calculator">
                <p className="m-6 text-red-600">
                    Failed to load inventory.
                </p>
            </Layout>
        );
    }
    if (!inventory) {
        return (
            <Layout pageName="Order Calculator">
                <p className="m-6">Loading inventory...</p>
            </Layout>
        );
    }
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
    function reset() {
        setSelectedBarcodes((currentBarcodes) => {
            return []
        })
    }
    const inventoryItems = Object.values(inventory);
    const selectedItems = inventoryItems.filter((item) =>
        selectedBarcodes.includes(item.barcode)
    );

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

        return !isSelected && matchesSearch;
    });
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
                        Calculate Order
                    </h1>

                    <p className="mb-4 text-gray-600">
                        Selected items:
                    </p>

                    <ul className="list-disc pl-6">
                        {selectedItems.map((item) => (
                            <li key={item.barcode}>
                                {item.itemName}
                            </li>
                        ))}
                    </ul>
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
                    />
                )}

                <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <label
                            htmlFor="inventory-search"
                            className="mb-1 block font-semibold"
                        >
                            Filter:
                        </label>

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
                                className="block w-full rounded border border-gray-300 bg-white py-2 pl-8 pr-6 text-sm text-gray-600 placeholder-gray-300 focus:border-gray-400 focus:outline-none sm:w-64"
                            />
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

                />

            </main>
        </Layout>
    )

}