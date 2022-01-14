export default function TableRow({barcode, itemName, itemCount, itemCategories, itemLowStock, showBarcodes, categoryData}) {
    const categoryReducer = (acc, obj) => {
        acc[obj.id] = obj.displayName
        return acc
    }
    let categoryLookup = []
    if (categoryData) {
        categoryLookup = categoryData.categories.reduce(categoryReducer, [])
    }

    function categoryDisplay(itemCategories) {
        const toDisplay = []
        for (const key in itemCategories) {
            toDisplay.push(
                <span className="relative inline-block p-1 px-3 py-1 font-semibold text-gray-900 leading-tight">
                    <span aria-hidden
                        className="absolute inset-0 bg-gray-400 opacity-50 rounded-full mx-1"></span>
                    <span className="relative">{categoryLookup[itemCategories[key]]}</span>
                </span>
            )
          }
        return toDisplay
    }

    // choose a "default" low stock threshold if not set 
    itemLowStock = parseInt(itemLowStock);
    itemLowStock = (itemLowStock && itemLowStock >= 0) ? itemLowStock : 10;

    return (
        <tr id={barcode}>
        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
            <div className="flex items-center">
                <div className="ml-3">
                    <p className="text-gray-900 whitespace-no-wrap">
                        {itemName}
                    </p>
                </div>
            </div>
            {showBarcodes ? <div id={`barcode-${barcode}`} className="ml-3 text-gray-500">{barcode}</div> : ""}
        </td>
        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
            <p className="text-gray-900 whitespace-no-wrap">{categoryDisplay(itemCategories)}</p>
        </td>
        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
            <p className="text-gray-900 whitespace-no-wrap font-bold itemCount">
                {itemCount}
            </p>
        </td>
        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
            {(itemCount > itemLowStock) && <span
                className="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight">
                <span aria-hidden
                    className="absolute inset-0 bg-green-200 opacity-50 rounded-full"></span>
                <span className="relative overflow-hidden whitespace-no-wrap">In Stock</span>
            </span>}
            {(itemLowStock >= itemCount) && (itemCount > 0) && <span
                className="relative inline-block px-3 py-1 font-semibold text-yellow-900 leading-tight">
                <span aria-hidden
                    className="absolute inset-0 bg-yellow-200 opacity-50 rounded-full"></span>
                <span className="relative overflow-hidden whitespace-no-wrap">Low Stock</span>
            </span>}
            {(itemCount <= 0) && <span
                className="relative inline-block px-3 py-1 font-semibold text-red-900 leading-tight">
                <span aria-hidden
                    className="absolute inset-0 bg-red-200 opacity-50 rounded-full"></span>
                <span className="relative overflow-hidden whitespace-no-wrap">Out of Stock</span>
            </span>}
        </td>
    </tr>
    )
    }