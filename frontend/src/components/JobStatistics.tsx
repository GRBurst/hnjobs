import React from "react";
import { Item } from "../models/Item";
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { TagFilter } from "../models/TagFilter";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface JobStatisticsProps {
    allItems: Item[],
    items: Item[],
    activeFilters: TagFilter[],
    darkMode: boolean,
}
export const JobStatistics = ({ allItems, items, activeFilters, darkMode }: JobStatisticsProps) => {
    const options = {
        responsive: true,
        scales: {
            x: {
                stacked: true,
            },
            y: {
                stacked: true,
            }
        },
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Filtered Data',
            },
        },
    };

    const labels = activeFilters.map(f => f.name)
    const datasets = [
        {
            label: "Total",
            data: activeFilters.map(f =>
                allItems.filter(item => item.text ? item.text.search(f.pattern) > -1 : false).length,
            )
        },
        {
            label: "Filtered",
            data: activeFilters.map(f =>
                items.filter(item => item.text ? item.text.search(f.pattern) > -1 : false).length,
            )
        },
    ]
    const data = {
        labels,
        datasets: datasets
    }

    return (
        <Bar style={{ maxHeight: 200 }} options={options} data={data} />
    );
}
JobStatistics.defaultProps = {
    darkMode: false,
}