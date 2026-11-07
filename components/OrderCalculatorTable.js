export default function OrderCalculatorTable({ items, selectedBarcodes, onToggleItem, categoryLookup, onFavorite }) {
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
                                <span className="sr-only">
                                    Favorite
                                </span>
                            </th>
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
                                categoryLookup={categoryLookup}
                                onFavorite={onFavorite}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function OrderCalculatorRow({ item, isSelected, onToggleItem, categoryLookup, onFavorite }) {
    const itemCategories = Array.isArray(item.categoryName)
        ? item.categoryName
        : [];
    return (
        <tr id={item.barcode}>
            <td className="border-b border-gray-100 bg-white px-3 py-3 text-center text-sm">
                <button
                    type="button"
                    onClick={() => onFavorite(item)}
                    aria-pressed={Boolean(item.favorited)}
                    aria-label={
                        item.favorited
                            ? `Remove ${item.itemName} from favorites`
                            : `Add ${item.itemName} to favorites`
                    }

                >
                    {Boolean(item.favorited) ?

                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill=" #ffc107" class="bi bi-star-fill" viewBox="0 0 16 16">
                            <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
                        </svg>

                        : <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-star" viewBox="0 0 16 16">
                            <path d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767-3.686 1.894.694-3.957a.56.56 0 0 0-.163-.505L1.71 6.745l4.052-.576a.53.53 0 0 0 .393-.288L8 2.223l1.847 3.658a.53.53 0 0 0 .393.288l4.052.575-2.906 2.77a.56.56 0 0 0-.163.506l.694 3.957-3.686-1.894a.5.5 0 0 0-.461 0z" />
                        </svg>
                    }
                </button>

            </td>
            <td className="border-b border-gray-100 bg-white px-5 py-5 text-sm">
                <div className="ml-3">
                    <p className="truncate text-gray-900">
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
                    {itemCategories
                        .map((categoryId) =>
                            categoryLookup[categoryId] || categoryId
                        )
                        .filter((categoryName) =>
                            categoryName !== "Uncategorized"
                        )
                        .join(", ")}
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
    const parsedLowStock = Number(lowStock);

    const lowStockThreshold = Number.isFinite(parsedLowStock)
        ? parsedLowStock
        : 10;

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