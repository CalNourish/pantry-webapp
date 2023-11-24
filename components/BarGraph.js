import React, { useRef } from "react"
import {
    Chart,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
  } from "chart.js";
import { Bar } from "react-chartjs-2";

Chart.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

Chart.defaults.font.family = "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif"
Chart.defaults.font.size = 14

export default function BarGraph({ data }) {
    data = JSON.parse(data)
    const chart = useRef(null)
    const chartTitle = data.title

    delete data.title

    const labels = Object.keys(data);
    const values = Object.values(data);

    const exportVisualization = () => {
        const chartInstance = chart.current
        const base64Image = chartInstance.toBase64Image()
        const a = document.createElement("a")

        a.download = chartTitle
        a.href = base64Image

        a.click()
    }

    const copyVisualization = () => {
        const chartInstance = chart.current
        const base64Image = chartInstance.toBase64Image()

        const base64ImageWithoutPrefix = base64Image.replace(/^data:[^;]+;base64,/, '');
        const binaryData = window.atob(base64ImageWithoutPrefix);

        const uint8Array = new Uint8Array(binaryData.length);
        for (let i = 0; i < binaryData.length; i++) {
            uint8Array[i] = binaryData.charCodeAt(i);
        }

        const base64ImageBlob = new Blob([uint8Array], { type: "image/png" });

        try {
            navigator.clipboard.write([
                new ClipboardItem({
                    "image/png": base64ImageBlob
                })
            ])
        } catch (err) {
            console.log(err)
        }
    }

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
                position: 'top',
            },
            title: {
                display: true,
                text: chartTitle,
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: "Hour"
                }
            }, 
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: "Average Number of People"
                }
            }, 
        },
        animation: {
            duration: 1250, 
            easing: "easeOutQuad", 
          }
    };

    data = {
        labels,
        datasets: [
          {
            label: "Count",
            data: values,
            backgroundColor: 'rgba(13, 50, 95, 0.75)',
          },
        ],
      };

    return (
        <div style={{ position: "relative", margin: "auto", width: "75vw" }}>
            <Bar options={options} data={data} ref={chart} />
            <button className="my-2 mx-1 btn btn-pantry-blue w-full uppercase tracking-wide text-xs font-semibold focus:shadow-none w-20" onClick={() => copyVisualization()}>
                Copy
            </button>
            <button className="my-2 mx-1 btn btn-pantry-blue w-full uppercase tracking-wide text-xs font-semibold focus:shadow-none w-24" onClick={() => exportVisualization()}>
                Export
            </button>
        </div>
    )
}
