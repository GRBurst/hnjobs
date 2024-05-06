import { QueryChange } from "rxfire/database"
import { pipe, Effect } from "effect"

import { get, child, DatabaseReference, DataSnapshot } from "firebase/database";

import { Item } from "../models/Item"
import { TagFilter, TagFilters } from "../models/TagFilter"

const getItemFromId = (dbRef: DatabaseReference, itemId: number): Effect.Effect<Item, Error> => {

    console.log(`itemId: ${itemId}`)
    const existsOption = (job: DataSnapshot) => job.exists() ? Effect.succeed(job.val()) : Effect.fail(new Error("No data"));

    const result = pipe(
      Effect.tryPromise(() => get(child(dbRef, `v0/item/${itemId}`))),
      Effect.flatMap(existsOption)
    );

    return result;
}

const getItemsFromIds = <T,>(dbRef: DatabaseReference, itemIdsHolder: Iterable<T>, itemIdExtractor: (itemIdHolder: T) => number): Effect.Effect<Item[], Error> => Effect.forEach(itemIdsHolder, (idHolder: T) => getItemFromId(dbRef, itemIdExtractor(idHolder)));

const getItemsFromQueryIds = (dbRef: DatabaseReference, itemIds: QueryChange[]): Effect.Effect<Item[], Error> => {
    return getItemsFromIds(dbRef, itemIds, idHolder => idHolder.snapshot.val())
}

const getKidItemsFromIds = (dbRef: DatabaseReference, kidsArray: number[][]) => Effect.all(
        kidsArray.map(itemKids => getItemsFromIds(dbRef, itemKids, x => x))
    )

const filterByRegexAny = (haystack: string | undefined, patterns: RegExp[]): boolean =>
    patterns
        .reduce<boolean>((acc, pattern) => acc || (haystack !== undefined && haystack.search(pattern) > -1), false)

const filterByRegex = (haystack: string | undefined, patterns: RegExp[]): boolean => 
    patterns
        .reduce<boolean>((acc, pattern) => acc && (haystack !== undefined && haystack.search(pattern) > -1), true)

const replaceTagCaptureGroup = (tag: TagFilter) => TagFilter({name: tag.name, pattern: RegExp(tag.pattern.source.replace(/(\()([^(:?)].*\))/, "(:?$2"), tag.pattern.flags)})

const itemFilter = (items: Item[], tagFilters: TagFilter[], searchFilter: string | undefined = undefined, parentFilter: number | undefined = undefined, filterFlagged: boolean = true) => items
    .filter(item => 
        item.text !== undefined
        && item.text != ""
        && !(filterFlagged && item.text?.toLocaleLowerCase().includes("[flagged]"))
        && parentFilter !== undefined ? item.parent == parentFilter : true
    )
    .filter(item => filterByRegex(item.text, tagFilters.map(tag => tag.pattern)))
    .filter(item => searchFilter !== undefined ? item.text?.includes(searchFilter) : true)
    .reverse()

const flatFilters = (filters: Map<string, TagFilters>): TagFilter[] => Array.from(filters.values()).map(filterSet => Array.from(filterSet)).flat()

export {getItemFromId, getItemsFromIds, getItemsFromQueryIds, getKidItemsFromIds, flatFilters, filterByRegex, filterByRegexAny, itemFilter, replaceTagCaptureGroup}

