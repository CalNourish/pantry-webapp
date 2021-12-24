import useSWR from 'swr';


export default function TableRow({itemName, itemCount, itemCategories, itemLowStock}) {
    const fetcher = (url) => fetch(url).then((res) => res.json());
    const { data, error } = useSWR("/api/categories/ListCategories", fetcher);
    const categoryReducer = (acc, obj) => {
        acc[obj.id] = obj.displayName
        return acc
    }
    let categoryLookup = []
    if (data) {
        categoryLookup = data.categories.reduce(categoryReducer, []) 
    } 

    function categoryDisplay(itemCategories) {
        const toDisplay = []
        for (const element of itemCategories) {
            toDisplay.push(
                <span className="relative inline-block p-1 px-3 py-1 font-semibold text-gray-900 leading-tight">
                    <span aria-hidden
                        className="absolute inset-0 bg-gray-400 opacity-50 rounded-full"></span>
                    <span className="relative">{categoryLookup[element]}</span>
                </span>
            )
          }
        return toDisplay
    }

    // choose a "default" low stock threshold if not set 
    itemLowStock = (itemLowStock >= 0) ? itemLowStock : 10;

    return (
        <tr>
        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
            <div className="flex items-center">
                <div className="ml-3">
                    <p className="text-gray-900 whitespace-no-wrap">
                        {itemName}
                    </p>
                </div>
            </div>
        </td>
        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
            <p className="text-gray-900 whitespace-no-wrap">{categoryDisplay(itemCategories)}</p>
        </td>
        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
            <p className="text-gray-900 whitespace-no-wrap font-bold">
                {itemCount}
            </p>
        </td>
        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
            {(itemCount > itemLowStock) && <span
                className="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight">
                <span aria-hidden
                    className="absolute inset-0 bg-green-200 opacity-50 rounded-full"></span>
                <span className="relative">In Stock</span>
            </span>}
            {(itemLowStock >= itemCount) && (itemCount > 0) && <span
                className="relative inline-block px-3 py-1 font-semibold text-yellow-900 leading-tight">
                <span aria-hidden
                    className="absolute inset-0 bg-yellow-200 opacity-50 rounded-full"></span>
                <span className="relative">Low Stock</span>
            </span>}
            {(itemCount <= 0) && <span
                className="relative inline-block px-3 py-1 font-semibold text-red-900 leading-tight">
                <span aria-hidden
                    className="absolute inset-0 bg-red-200 opacity-50 rounded-full"></span>
                <span className="relative">Out of Stock</span>
            </span>}
        </td>
    </tr>
    )
    }