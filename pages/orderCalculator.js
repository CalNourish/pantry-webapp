import Layout from '../components/Layout'
import OrderCalculatorTable from '../components/OrderCalculatorTable'
import { useUser } from '../context/userContext'
import useSWR from "swr"
import { useState } from "react";

const fetcher = (url) => fetch(url).then((response) => response.json());


export default function OrderCalculator() {
    const [selectedBarcodes, setSelectedBarcodes] = useState([]);
    const [searchFilter, setSearchFilter] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [defaultCartFilter, setDefaultCartFilter] = useState(false);
    const [step, setStep] = useState("select");
    const { user, loadingUser } = useUser();

    const {
        data: inventory,
        error: inventoryError
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

        const itemCategories = Array.isArray(item.categoryName)
            ? item.categoryName
            : [];

        const matchesCategory =
            !categoryFilter ||
            itemCategories.includes(categoryFilter);

        const matchesDefaultCart =
            !defaultCartFilter ||
            Boolean(item.defaultCart);

        return (
            !isSelected &&
            matchesSearch &&
            matchesCategory &&
            matchesDefaultCart
        );
    });
    function clearFilters() {
        setSearchFilter("");
        setCategoryFilter("");
        setDefaultCartFilter(false);
    }
    const hasActiveFilters =
        searchFilter !== "" ||
        categoryFilter !== "" ||
        defaultCartFilter;
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

                    <ul>
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
                        categoryLookup={categoryLookup}
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
                />

            </main>
        </Layout >
    )

}