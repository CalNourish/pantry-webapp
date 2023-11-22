import React from 'react';
import Layout from '../components/Layout'
import Sidebar from '../components/Sidebar'
import BarGraph from '../components/BarGraph'
import useSWR from 'swr';

const fetcher = (url) => {
    return fetch(url).then((res) => res.json())
};

// TODO: AUTHENTICATION

const inputAppearance = "appearance-none block w-full text-gray-600 border border-gray-100 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-400"

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
            data: undefined
        }
    }

    generateItemVisualization() {
        this.setState({
            showVisual: true,
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

    generatePersonVisualization() {
        this.setState({
            showVisual: true,
            data: null
        })

        fetch("/api/visualizations/GeneratePersonVisualization?weekHistory=" + this.selectedWeekHistory + "&onWeekday=" + this.selectedWeekday, {
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

    setSelectedItem(item) {
        console.log("Set selected item")
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

    renderVisualization() {
        if (!this.state.showVisual) {
            return 
        } else if (!this.state.data) {
            return <p>Loading...</p>
        } else {
            return (
                // <img class="block h-full w-auto object-none" draggable="false" src={this.state.data.requested}></img>
                <BarGraph data={this.state.data.requested} />
            )
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
                            <label class="text-medium font-medium">Item</label>
                            <div className="relative">
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
                            </div>
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
                            <button className="my-2 btn btn-pantry-blue w-full uppercase tracking-wide text-xs font-semibold focus:shadow-none" onClick={() => this.generatePersonVisualization()}>
                                Generate People Per Hour Visualization
                            </button>
                        </div>
                    </Sidebar>
                </div>
                <div class="py-8 px-8 h-screen flex justify-center">
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