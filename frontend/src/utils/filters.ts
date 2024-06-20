import { Item } from "../models/Item";
import { TagFilter, TagFilters } from "../models/TagFilter";

const filterByRegex = (haystack: string | undefined, patterns: RegExp[]): boolean => patterns
    .reduce<boolean>((acc, pattern) => acc && (haystack !== undefined && haystack.search(pattern) > -1), true);

const itemFilter = (items: Item[], tagFilters: TagFilter[], searchFilter: string | undefined = undefined) => {
    try {
        return items
            .filter(item => filterByRegex(item.text, tagFilters.map(tag => tag.pattern))
                && (searchFilter !== undefined ? item.text?.includes(searchFilter) : true));
    } catch (e) {
        console.warn(e);
        return [];
    }
};

const flatFilters = (filters: Map<string, TagFilters>): TagFilter[] => Array.from(filters.values()).map(filterSet => Array.from(filterSet)).flat();const filterByRegexAny = (haystack: string | undefined, patterns: RegExp[]): boolean => patterns
    .reduce<boolean>((acc, pattern) => acc || (haystack !== undefined && haystack.search(pattern) > -1), false);

const itemPrefilter = (items: Item[], parentFilter: number | undefined = undefined, userFilter: string | undefined = undefined, filterFlagged: boolean = true) => {
    try {
        return items
            .filter(item => item.text !== undefined
                && item.text !== null
                && item.text != ""
                && item.detached !== true
                && !(filterFlagged && item.text?.toLowerCase().includes("[flagged]"))
                && !(filterFlagged && item.text?.toLowerCase().includes("[dead]"))
                && (filterFlagged && (item.dead !== undefined && item.dead !== null ? item.dead == false : true))
                && (parentFilter !== undefined && parentFilter !== null ? item.parent == parentFilter : true)
                && (userFilter !== undefined && userFilter !== null ? item.by == userFilter : true)
            )
            .reverse();
    } catch (e) {
        console.warn(e);
        return [];
    }
};


export { filterByRegex, filterByRegexAny, flatFilters, itemFilter, itemPrefilter };
