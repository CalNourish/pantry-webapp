import TableRow from "./TableRow"
import useSWR from 'swr';
import React, { useState } from 'react';


export default function Table(props) {
    // get category lookup info
    const fetcher = (url) => fetch(url).then((res) => res.json());
    const { data, error } = useSWR("/api/categories/ListCategories", fetcher);
    const [categoryFilter, setCategoryFilter] = useState("");
    const [searchFilter, setSearchFilter] = useState("");

    if (!props.data || !data) {
        return null
    }

    console.log(categoryFilter, searchFilter);

    function inFilter(barcode) {
        var success = true;
        const categories = props.data[barcode].categoryName;
        if (categoryFilter) {
            success = false;
            for (var idx in categories) {
                if (categoryFilter == categories[idx]) {
                    success = true;
                    break;
                }
            }
        }
        const name = props.data[barcode].itemName.toLowerCase();
        if (success && searchFilter) {
            if (name.indexOf(searchFilter) == -1 && !barcode.startsWith(searchFilter)) {
                success = false;
            }
        }
        return success;
    }

    // do any filtering here - edit the data variable
    var itemData = {};
    if (categoryFilter || searchFilter) {
        for (let item in props.data) {
            if (inFilter(item)) {
                itemData[item] = props.data[item];
            }
        }
    } else {
        itemData = props.data;
    }

  return (
    <div className="antialiased font-sans">
    <div className="container mx-auto px-4 sm:px-8">
        <div className="py-8">
            <div className="mr-0">
                <div className="font-semibold">Filter:</div>
                <div className="my-2 flex sm:flex-row flex-col">
                    <div className="flex flex-row mb-1 sm:mb-0">
                        {/* <div className="relative">
                            <select
                                className="appearance-none h-full rounded-l border block w-full bg-white border-gray-400 text-gray-700 py-2 px-4 pr-8 leading-tight focus:outline-none focus:bg-white focus:border-gray-500">
                                <option>5</option>
                                <option>10</option>
                                <option>20</option>
                            </select>
                            <div
                                className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                </svg>
                            </div>
                        </div> */}
                        <div className="relative">
                            <select className="appearance-none h-full rounded-l border block w-full bg-white border-gray-400 text-gray-700 py-2 px-4 pr-8 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                    onChange={(e) => {setCategoryFilter(e.target.value)}}>
                                <option value="">All categories</option>
                                {data.categories.map((cat) => {
                                    return <option value={cat.id}>{cat.displayName}</option>
                                })}
                            </select>
                            <div
                                className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="block relative">
                        <span className="h-full absolute inset-y-0 left-0 flex items-center pl-2">
                            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current text-gray-500">
                                <path
                                    d="M10 4a6 6 0 100 12 6 6 0 000-12zm-8 6a8 8 0 1114.32 4.906l5.387 5.387a1 1 0 01-1.414 1.414l-5.387-5.387A8 8 0 012 10z">
                                </path>
                            </svg>
                        </span>
                        <input placeholder="Search name or barcode" onChange={(e) => {setSearchFilter(e.target.value.toLowerCase())}}
                            className="appearance-none rounded-r rounded-l sm:rounded-l-none border border-gray-400 border-b block pl-8 pr-6 py-2 w-full bg-white text-sm placeholder-gray-400 text-gray-700 focus:bg-white focus:placeholder-gray-600 focus:text-gray-700 focus:outline-none" />
                    </div>
                </div>
            </div>
            <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
                <div className="inline-block min-w-full shadow rounded-lg overflow-hidden">
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr>
                                <th
                                    className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-3/4">
                                    Item Name
                                </th>
                                <th
                                    className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Category
                                </th>
                                <th
                                    className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Count
                                </th>
                                <th
                                    className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            { Object.keys(itemData).map((key) => {
                                return <TableRow key={key} id={key} itemName={itemData[key].itemName} itemCount={itemData[key].count} itemCategories={itemData[key].categoryName} 
                                                 itemLowStock={itemData[key].lowStock} showBarcodes={true} categoryData={data} />
                            }) 
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
    </div>  
  )
}