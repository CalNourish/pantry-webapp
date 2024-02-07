import React from 'react';
import Layout from '../components/Layout'
import Sidebar from '../components/Sidebar'
import BarGraph from '../components/BarGraph'
import useSWR from 'swr';

const fetcher = (url) => {
    return fetch(url).then((res) => res.json())
};

// TODO: AUTHENTICATION

const inputAppearance = "appearance-none h-full rounded-l rounded-r border block w-full bg-white border-gray-300 text-gray-600 py-2 px-4 pr-8 leading-tight focus:outline-none focus:bg-white focus:border-gray-400"

const historyTimeFrame = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]
const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

class Visualization extends React.Component {
    constructor(props) {
        super(props)
        this.selectedItem = undefined

        let itemList = []

        for (const value of Object.values(props.data)) {
            itemList.push(value.itemName)
        }

        this.itemList = itemList.sort((a, b) => {
            const lowerA = a.toLowerCase()
            const lowerB = b.toLowerCase()

            if (lowerA < lowerB) {
                return -1;
            } else if (lowerA > lowerB) {
                return 1;
            } else {
                return 0;
            }
        })

        this.state = {
            showVisual: false,
            visualizationType: undefined,
            data: undefined,
            searchResults: undefined,
            selectedItem: undefined
        }
    }

    generateItemVisualization() {
        this.setState({
            showVisual: true,
            visualizationType: 0,
            data: null
        })

        fetch("/api/visualizations/GenerateItemVisualization?item=" + this.selectedItem, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            }).then((res) => {
                console.log("API Call: /GenerateItemVisualization")

                res.json().then((data) => {
                    this.setState({
                        data: data
                    })
                })
            });
    }

    generatePPHVisualization() {
        this.setState({
            showVisual: true,
            visualizationType: 1,
            data: null
        })

        fetch("/api/visualizations/GeneratePPHVisualization?weekHistory=" + this.selectedWeekHistory + "&onWeekday=" + this.selectedWeekday, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            }).then((res) => {
                console.log("API Call: /GeneratePersonVisualization")

                res.json().then((data) => {
                    this.setState({
                        data: data
                    })
                })
            });
    }

    generatePPDVisualization() {
        this.setState({
            showVisual: true,
            visualizationType: 2,
            data: null
        })

        fetch("/api/visualizations/GeneratePPDVisualization?weekHistory=" + this.selectedWeekHistory, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            }).then((res) => {
                console.log("API Call: /GeneratePersonVisualization")

                res.json().then((data) => {
                    this.setState({
                        data: data
                    })
                })
            });
    }

    setSearch(item) {
        console.log("Set search " + item)
        // console.log(this.itemList.filter((str) => {return str.toLowerCase().includes(this.search)}))
        this.setState({
            searchResults: this.itemList.filter((str) => {return str.toLowerCase().includes(item)}).slice(0, 5)
        })
        this.search = item;
    }

    setSelectedItem(item) {
        console.log("Set selected item " + item)
        this.setState({
            selectedItem: item
        })
        this.selectedItem = item;
    }

    setSelectedWeekHistory(weekHistory) {
        console.log("Set selected week history")
        this.selectedWeekHistory = weekHistory;
    }

    setSelectedWeekday(weekday) {
        console.log("Set selected weekday")
        this.selectedWeekday = weekday;
    }

    cancelVisualization() {
        this.state.showVisual = false
    }

    renderVisualization() {
        if (!this.state.showVisual) {
            return 
        } else if (!this.state.data) {
            return (
                <>
                <p className="text-center text-medium font-medium">Loading...</p>
                <button className="my-2 mx-1 btn btn-pantry-blue w-full uppercase tracking-wide text-xs font-semibold focus:shadow-none w-24" onClick={() => this.cancelVisualization()}>
                    Cancel
                </button>
                </>
            )
        } else {
            if (this.state.visualizationType == 0) {
                return <BarGraph data={this.state.data.requested} xAxis="Day" yAxis="Item Count" />
            } else if (this.state.visualizationType == 1) {
                return <BarGraph data={this.state.data.requested} xAxis="Hour" yAxis="Average Number of People" />
            } else if (this.state.visualizationType == 2) {
                return <BarGraph data={this.state.data.requested} xAxis="Day" yAxis="Average Number of People" />
            }
        }
    }

    render() {
        const { showVisual, data } = this.state;

        return (
            <Layout pageName="Visualizations">
            <div className="flex">
                <div className="w-64 items-center">
                    <Sidebar>
                        <h1 className="text-3xl font-semibold mb-2">Visualizations</h1>
                        <div className="my-4">
                            <label class="text-medium font-medium">Item {
                                this.state.selectedItem
                                ? (<>(Selected: {this.state.selectedItem})</>)
                                : null
                            }</label>
                            <div className="block relative">
                                <span className="h-full absolute inset-y-0 left-0 flex items-center pl-2">
                                    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current text-gray-400">
                                        <path
                                            d="M10 4a6 6 0 100 12 6 6 0 000-12zm-8 6a8 8 0 1114.32 4.906l5.387 5.387a1 1 0 01-1.414 1.414l-5.387-5.387A8 8 0 012 10z">
                                        </path>
                                    </svg>
                                </span>
                                <input placeholder="Search name" onChange={(e) => {this.setSearch(e.target.value)}}
                                className="appearance-none rounded-r rounded-l border border-gray-300 border-b block pl-8 pr-6 py-2 w-full bg-white text-sm placeholder-gray-300 text-gray-600 focus:bg-white focus:placeholder-gray-500 focus:text-gray-600 focus:outline-none" />
                            </div>
                            {
                                this.search 
                                ? this.state.searchResults.map((item, index) => (
                                    <>
                                        <p className="cursor-pointer" onClick={(e) => this.setSelectedItem(item)}>{item}</p>
                                        <hr />
                                    </>
                                )) 
                                : null
                            }
                            {/* <div className="relative">
                                <select className={inputAppearance + " w-56"}  onChange={(e) => this.setSelectedItem(e.target.value)}>
                                    <option value="">-</option>
                                    {
                                        this.itemList.map((item, index) => (
                                            <option key={index} value={item}>
                                                {item}
                                            </option>
                                            )
                                        )
                                    }
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-600">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                </div>
                            </div> */}
                            <button className="my-2 btn btn-pantry-blue w-full uppercase tracking-wide text-xs font-semibold focus:shadow-none" onClick={() => this.generateItemVisualization()}>
                                Generate Item Visualization
                            </button>
                            <hr className="my-2 border-gray-400 border-1"/>
                            <label class="text-medium font-medium">How many weeks to go back</label>
                            <div className="relative">
                                <select className={inputAppearance + " w-56"}  onChange={(e) => this.setSelectedWeekHistory(e.target.value)}>
                                    <option value="">-</option>
                                    {
                                        historyTimeFrame.map((item, index) => (
                                            <option key={index} value={item}>
                                                {item}
                                            </option>
                                            )
                                        )
                                    }
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-600">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                </div>
                            </div>
                            <label class="text-medium font-medium">Weekday</label>
                            <div className="relative">
                                <select className={inputAppearance + " w-56"}  onChange={(e) => this.setSelectedWeekday(e.target.value)}>
                                    <option value="">-</option>
                                    {
                                        weekdays.map((item, index) => (
                                            <option key={index} value={item}>
                                                {item}
                                            </option>
                                            )
                                        )
                                    }
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-600">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                </div>
                            </div>
                            <button className="my-2 btn btn-pantry-blue w-full uppercase tracking-wide text-xs font-semibold focus:shadow-none" onClick={() => this.generatePPHVisualization()}>
                                Generate People Per Hour Visualization
                            </button>
                            <hr className="my-2 border-gray-400 border-1"/>
                            <label class="text-medium font-medium">How many weeks to go back</label>
                            <div className="relative">
                                <select className={inputAppearance + " w-56"}  onChange={(e) => this.setSelectedWeekHistory(e.target.value)}>
                                    <option value="">-</option>
                                    {
                                        historyTimeFrame.map((item, index) => (
                                            <option key={index} value={item}>
                                                {item}
                                            </option>
                                            )
                                        )
                                    }
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-600">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                </div>
                            </div>
                            <button className="my-2 btn btn-pantry-blue w-full uppercase tracking-wide text-xs font-semibold focus:shadow-none" onClick={() => this.generatePPDVisualization()}>
                                Generate People Per Day Visualization
                            </button>
                        </div>
                    </Sidebar>
                </div>
                <div class="py-8 px-8 mx-auto">
                    { this.renderVisualization() }
                </div>
            </div>
            </Layout>
        )
    }
}

export default function Visualizations() {
    let { data, error } = useSWR("api/inventory/GetAllItems", fetcher)

    if (error) { 
        return (
            <Layout pageName="Visualizations">
                <h1 className='text-xl m-6'>Failed to load</h1>
            </Layout>
        )
    }

    if (!data) {
        return (
            <Layout pageName="Visualizations">
                <h1 className='text-xl m-6'>Loading...</h1>
            </Layout>
        )
    }

    return (
        <Visualization data={data}></Visualization>
    )
}