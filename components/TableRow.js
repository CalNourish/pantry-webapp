import useSWR from 'swr';


export default function TableRow({itemName, itemCount, itemCategories}) {
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
                <span class="relative inline-block p-1 px-3 py-1 font-semibold text-gray-900 leading-tight">
                    <span aria-hidden
                        class="absolute inset-0 bg-gray-400 opacity-50 rounded-full"></span>
                    <span class="relative">{categoryLookup[element]}</span>
                </span>
            )
          }
          return toDisplay
    }

    return (
        <tr>
        <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
            <div class="flex items-center">
                <div class="ml-3">
                    <p class="text-gray-900 whitespace-no-wrap">
                        {itemName}
                    </p>
                </div>
            </div>
        </td>
        <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
            <p class="text-gray-900 whitespace-no-wrap">{categoryDisplay(itemCategories)}</p>
        </td>
        <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
            <p class="text-gray-900 whitespace-no-wrap font-bold">
                {itemCount}
            </p>
        </td>
        <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
            {(itemCount > 10) && <span
                class="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight">
                <span aria-hidden
                    class="absolute inset-0 bg-green-200 opacity-50 rounded-full"></span>
                <span class="relative">In Stock</span>
            </span>}
            {(10 >= itemCount) && (itemCount > 0) && <span
                class="relative inline-block px-3 py-1 font-semibold text-yellow-900 leading-tight">
                <span aria-hidden
                    class="absolute inset-0 bg-yellow-200 opacity-50 rounded-full"></span>
                <span class="relative">Low Stock</span>
            </span>}
            {(itemCount == 0) && <span
                class="relative inline-block px-3 py-1 font-semibold text-red-900 leading-tight">
                <span aria-hidden
                    class="absolute inset-0 bg-red-200 opacity-50 rounded-full"></span>
                <span class="relative">Out of Stock</span>
            </span>}
        </td>
    </tr>
    )
    }