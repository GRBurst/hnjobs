import React from "react";

import Chart from "react-apexcharts";

import { Item } from "../models/Item";
import { TagFilter } from "../models/TagFilter";


interface JobStatisticsProps {
    allItems: Item[],
    items: Item[],
    activeFilters: TagFilter[],
    darkMode: boolean,
}
export const JobStatistics = ({ allItems, items, activeFilters, darkMode }: JobStatisticsProps) => {
    const options: ApexCharts.ApexOptions = {
        xaxis: {
            type: "category"
        },
        legend: {
            position: "top"
        },
        theme: {
            mode: darkMode ? "dark" : "light"
        }
    };
    const series = [
        {
            name: "Shown",
            data: activeFilters.map(f => (
                {
                    x: f.name,
                    y: items.filter(item => item.text ? item.text.search(f.pattern) > -1 : false).length,
                }
            ))
        },
        {
            name: "Total",
            data: activeFilters.map(f => (
                {
                    x: f.name,
                    y: allItems.filter(item => item.text ? item.text.search(f.pattern) > -1 : false).length,
                }
            ))
        },
    ];

    if (allItems.length == 0 || items.length == 0 || activeFilters.length == 0) return <></>
    return (
        <Chart
            height={200}
            type="bar"
            options={options}
            series={series}
            style={{ maxHeight: 200 }}
        />
    );
}
JobStatistics.defaultProps = {
    darkMode: false,
}