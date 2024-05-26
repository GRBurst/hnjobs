import { VennDiagram, VennSeries } from 'reaviz';

import { Item } from "../models/Item";
import { TagFilter } from "../models/TagFilter";
import { itemFilter } from "../utils/hn";


interface JobStatisticsProps {
    allItems: Item[],
    items: Item[],
    activeFilters: TagFilter[],
}
export const JobStatistics = ({ allItems, items, activeFilters }: JobStatisticsProps) => {
    const combineElements = (filters: TagFilter[]): TagFilter[][] => {
        if (filters.length === 0) return [[]];
        let firstElem = filters[0];
        let restCombs = combineElements(filters.slice(1));
        let combsWithFirst = restCombs.map(comb => [firstElem, ...comb]);
        return restCombs.concat(combsWithFirst);
    }

    const filterCombinations = combineElements(activeFilters).filter(f => f.length > 0 && f.length < activeFilters.length)
    console.debug("venn combos: ", filterCombinations)
    const series = filterCombinations.map(comboFilter => (
        {
            key: comboFilter.map(f => f.name),
            data: itemFilter(allItems, comboFilter).length
        }
    )).concat([
        {
            key: activeFilters.map(f => f.name),
            data: items.length
        }
    ])

    console.debug("venn: ", series)

    if (allItems.length == 0 || activeFilters.length == 0 || series.length == 0) return <></>
    return (
        <VennDiagram
            data={series}
            height={200}
            width={400}
            series={<VennSeries colorScheme="dark2" />}
        />
    );
}