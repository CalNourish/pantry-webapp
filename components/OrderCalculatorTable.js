export default function OrderCalculatorTable({ items, selectedBarcodes, onToggleItem }) {
    const headerClass =
        "px-5 py-3 border-b-2 border-gray-100 bg-gray-50 " +
        "text-xs font-semibold text-gray-500 uppercase " +
        "tracking-wider text-left";
    if (items.length === 0) {
        return (
            <div className="py-6 text-center font-semibold text-gray-500">
                No items found.
            </div>
        );
    }
    return (
        <div className="-mx-4 px-4 py-4 overflow-x-auto sm:-mx-8 sm:px-8">
            <div className="inline-block min-w-full overflow-hidden rounded-lg shadow">
                <table className="min-w-full table-auto leading-normal">
                    <thead>
                        <tr>
                            <th className={headerClass}>
                                <div className="ml-3">
                                    Item Name
                                </div>
                            </th>

                            <th className={headerClass}>
                                <div className="text-center">
                                    Count
                                </div>
                            </th>


                            <th className={headerClass}>
                                Status
                            </th>

                            <th className={headerClass}>
                                Category
                            </th>

                            <th className={headerClass}>
                                <span className="sr-only">
                                    Select
                                </span>
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {items.map((item) => (
                            <OrderCalculatorRow
                                key={item.barcode}
                                item={item}
                                isSelected={selectedBarcodes.includes(item.barcode)}
                                onToggleItem={onToggleItem}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function OrderCalculatorRow({ item, isSelected, onToggleItem }) {
    return (
        <tr id={item.barcode}>
            <td className="border-b border-gray-100 bg-white px-5 py-5 text-sm">
                <div className="ml-3">
                    <p className="whitespace-nowrap text-gray-900">
                        {item.itemName}
                    </p>

                    <p className="text-gray-400">
                        {item.barcode}
                    </p>
                </div>
            </td>

            <td className="border-b border-gray-100 bg-white px-3 py-3 text-center text-sm">
                <p className="whitespace-nowrap font-bold text-gray-900">
                    {item.count}
                </p>
            </td>


            <td className="border-b border-gray-100 bg-white px-3 py-3 text-sm">
                <StockStatus
                    count={item.count}
                    lowStock={item.lowStock}
                />
            </td>

            <td className="border-b border-gray-100 bg-white px-5 py-5 text-sm">
                <p className="max-w-xs text-gray-900">
                    {item.categoryName?.join(", ")}
                </p>
            </td>

            <td className="w-28 whitespace-nowrap border-b border-gray-100 bg-white px-3 py-3 text-center text-sm">
                {isSelected ? (
                    <button
                        type="button"
                        onClick={() => onToggleItem(item.barcode)}
                        aria-label={`Remove ${item.itemName} from order`}
                        title="Remove from order"
                        className="rounded p-1 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-pantry-blue-500"
                    >
                        <img
                            src="/images/trash-can.svg"
                            alt=""
                            className="h-6 w-6"
                        />
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={() => onToggleItem(item.barcode)}
                        aria-label={`Add ${item.itemName} to order`}
                        title="Add to order"
                        className="inline-flex h-7 w-7 items-center justify-center rounded border-2 border-pantry-blue-500 text-xl font-bold leading-none text-pantry-blue-500 hover:bg-pantry-blue-50 focus:outline-none focus:ring-2 focus:ring-pantry-blue-500"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                        >
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                    </button>
                )}
            </td>
        </tr>
    );
}

function StockStatus({ count, lowStock }) {
    const itemCount = Number(count);
    const lowStockThreshold = Number(lowStock) || 10;

    if (itemCount <= 0) {
        return (
            <span className="relative inline-block px-3 py-1 font-semibold leading-tight text-red-900">
                <span
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-red-200 opacity-50"
                />
                <span className="relative whitespace-nowrap">
                    Out of Stock
                </span>
            </span>
        );
    }

    if (itemCount <= lowStockThreshold) {
        return (
            <span className="relative inline-block px-3 py-1 font-semibold leading-tight text-yellow-900">
                <span
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-yellow-200 opacity-50"
                />
                <span className="relative whitespace-nowrap">
                    Low Stock
                </span>
            </span>
        );
    }

    return (
        <span className="relative inline-block px-3 py-1 font-semibold leading-tight text-green-900">
            <span
                aria-hidden
                className="absolute inset-0 rounded-full bg-green-200 opacity-50"
            />
            <span className="relative whitespace-nowrap">
                In Stock
            </span>
        </span>
    );
}