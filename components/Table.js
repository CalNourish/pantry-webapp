import TableRow from "./TableRow"
import React, { useState } from 'react';
import useSWR from 'swr';
import { server } from "../pages/_app.js"

/* Table used in the inventory page. */
export default function Table(props) {
    // get category lookup info
    const fetcher = (url) => fetch(url).then((res) => res.json());
    const { data: categoryData, error } = useSWR(`${server}/api/categories/ListCategories`, fetcher);
    const [categoryFilter, setCategoryFilter] = useState("");
    const [searchFilter, setSearchFilter] = useState("");
    const [sortBy, setSortBy] = useState("status");
    const [defaultCartFilter, setdefaultCartFilter] = useState(false)

    if (!props.data || !categoryData) {
        return null
    }

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
        var defaultCart = props.data[barcode].defaultCart;
        if (success && defaultCartFilter) {
            success = defaultCart
        }
            
        return success;
    }

    function comparator(primary, descending, secondary="barcode", descending2=false) {
        let sgn = descending ? -1 : 1;
        let sgn2 = descending2 ? -1 : 1;
        return (a, b) => {
            if (a[primary] > b[primary]) return 1 * sgn;
            if (a[primary] < b[primary]) return -1 * sgn;
            return (a[secondary] > b[secondary]) ? sgn2 : -sgn2;
        }
    }

    function compareStatus(descending=false, secondary="barcode", descending2=false) {
        let sgn = descending ? -1 : 1;
        let sgn2 = descending2 ? -1 : 1;
        return (a, b) => {
            /* sort ascending alphabetically by default */
            let astock = a["count"] > 0;
            let bstock = b["count"] > 0
            
            if (astock && (!bstock)) return -1 * sgn;
            if ((!astock) && bstock) return 1 * sgn;
            return (a[secondary] > b[secondary]) ? sgn2 : -sgn2;
        }
    }
        
    function sortRows(array) {
        /* sortBy should be a name of an object field */
        /* goal: stable sort (preserve previous ordering) */
        var reverse = false;
        switch(sortBy) {
            case "-itemName":
                reverse = true;
            case "itemName":
                array.sort(comparator("itemName", reverse));
                break;
            case "-count":
                reverse = true;
            case "count":
                // default count order is high -> low
                array.sort(comparator("count", !reverse, props.authToken ? "barcode" : "itemName"));
                break;
            case "-status":
                reverse = true;
            case "status":
                // sort by status, then barcode (if auth user) or itemName (if public user) 
                array.sort(compareStatus(reverse, props.authToken ? "barcode" : "itemName"));
                break;
            default:
                array.sort(comparator(props.authToken ? "barcode" : "itemName"))
        }
    }

    // do any filtering here - edit the data variable
    var itemData = [];
    for (let item in props.data) {
        if (inFilter(item)) {
            itemData.push(props.data[item]);
        }
    }
    sortRows(itemData);

    let headerClass = "px-5 py-3 border-b-2 border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider text-left"
    
    return (
    <div className="antialiased font-sans">
    <div className="container mx-auto px-4 sm:px-8">
        <div className="py-8">
            <div className="mr-0">
                <div className="font-semibold">Filter:</div>
                <div className="my-2 flex sm:flex-row flex-col">
                    <div className="flex flex-row mb-1 sm:mb-0">
                        <div className="relative">
                            <select className="appearance-none h-full rounded-l border block w-full bg-white border-gray-300 text-gray-600 py-2 px-4 pr-8 leading-tight focus:outline-none focus:bg-white focus:border-gray-400"
                                    onChange={(e) => {setCategoryFilter(e.target.value)}} value={categoryFilter}>
                                <option value="">All categories</option>
                                {Object.keys(categoryData.categories).map((key) => {
                                    let cat = categoryData.categories[key];
                                    return <option key={`categoryOption-${key}`} value={cat.id}>{cat.displayName}</option>
                                })}
                            </select>
                            <div
                                className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-600">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="block relative">
                        <span className="h-full absolute inset-y-0 left-0 flex items-center pl-2">
                            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current text-gray-400">
                                <path
                                    d="M10 4a6 6 0 100 12 6 6 0 000-12zm-8 6a8 8 0 1114.32 4.906l5.387 5.387a1 1 0 01-1.414 1.414l-5.387-5.387A8 8 0 012 10z">
                                </path>
                            </svg>
                        </span>
                        <input placeholder="Search name or barcode" onChange={(e) => {setSearchFilter(e.target.value.toLowerCase())}} value={searchFilter}
                            className="appearance-none rounded-r rounded-l sm:rounded-l-none border border-gray-300 border-b block pl-8 pr-6 py-2 w-full bg-white text-sm placeholder-gray-300 text-gray-600 focus:bg-white focus:placeholder-gray-500 focus:text-gray-600 focus:outline-none" />
                    </div>
                    <div className="my-auto ml-3 cursor-pointer text-gray-500 hover:text-gray-400" onClick={() => {setCategoryFilter(""); setSearchFilter(""); setSortBy("");}}>
                        {categoryFilter || searchFilter || sortBy ? "clear filters" : ""}
                    </div>
                </div>
                <div>
                    <input type="checkbox" id="default-cart-checkbox" checked={defaultCartFilter} onChange={(e) => setdefaultCartFilter(e.target.checked)}/>
                    <label htmlFor="default-cart-checkbox" className="text-gray-600"> Show Default Cart Items</label>

                </div>
            </div>
            <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
                <div className="inline-block min-w-full shadow rounded-lg overflow-hidden">
                    <table className="min-w-full leading-normal table-auto">
                        <thead>
                            <tr>
                                <th onClick={() => {setSortBy(sortBy == "itemName" ? "-itemName" : "itemName")}}
                                    className={headerClass+ " cursor-pointer"}>
                                    <div className="flex">
                                        <div className="ml-3">Item Name</div>
                                        <div className="ml-auto">{sortBy == "itemName" ? "\u25BC" : sortBy == "-itemName" ? "\u25B2" : ""}</div>
                                    </div>
                                </th>
                                <th
                                    className={headerClass}>
                                    Category
                                </th>
                                { props.authToken ? <th onClick={() => {setSortBy(sortBy == "count" ? "-count" : "count")}}
                                    className={headerClass + " cursor-pointer"}>
                                    <div className="flex">
                                        <div className="mr-3">Count</div>
                                        <div className="ml-auto">{sortBy == "count" ? "\u25BC" : sortBy == "-count" ? "\u25B2" : ""}</div>
                                    </div>
                                </th> : null}
                                <th onClick={() => {setSortBy(sortBy == "status" ? "-status" : "status")}}
                                    className={headerClass + " cursor-pointer"}>
                                    <div className="flex">
                                        <div>Status</div>
                                        <div className="ml-auto">{sortBy == "status" ? "\u25BC" : sortBy == "-status" ? "\u25B2" : ""}</div>
                                    </div>
                                </th>
                                { props.authToken ?
                                    <th className={headerClass + " w-28"}>Edit</th> : null}
                            </tr>
                        </thead>
                        <tbody>
                            { itemData.map((item, idx) => {
                                return (props.authToken || item.displayPublic) &&
                                    <TableRow key={idx} barcode={item.barcode} itemName={item.itemName} itemCount={item.count} itemCategories={item.categoryName}
                                              itemLowStock={item.lowStock} categoryData={categoryData} displayPublic={item.displayPublic} authToken={props.authToken}
                                              editItemFunc={props.editItemFunc} deleteItemFunc={props.deleteItemFunc} showHideItemFunc={props.showHideItemFunc}/>
                            }) 
                            }
                        </tbody>
                    </table>
                    {itemData.length == 0 ? <div className="text-center p-5 text-pantry-red-500 text-md font-semibold tracking-wider">no items found &#128577;</div> : ""}
                </div>
            </div>
        </div>
    </div>
    </div>  
  )
}