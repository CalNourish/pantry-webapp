export default function TableRow({itemName, itemCount, itemCategories}) {
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
                <p class="text-gray-900 whitespace-no-wrap">{Object.values(itemCategories)}</p>
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