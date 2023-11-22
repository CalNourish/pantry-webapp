import React from "react"
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

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
                position: 'top',
            },
            title: {
                display: true,
                text: data.title,
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
        }
    };

    delete data.title

    const labels = Object.keys(data);

    data = {
        labels,
        datasets: [
          {
            label: "Count",
            data: Object.values(data),
            backgroundColor: 'rgba(13, 50, 95, 0.75)',
          },
        ],
      };

    return (
        <div style={{ position: "relative", margin: "auto", width: "75vw" }}>
            <Bar options={options} data={data} />
        </div>
    )
}
