// @ts-expect-error: QueryChange is not exported correctly from rxfire/database
import { QueryChange } from "rxfire/database";

import { Effect, Either, pipe } from "effect";

import { DataSnapshot, DatabaseReference, child, get } from "firebase/database";

import { Schema } from "@effect/schema";
import { ParseError } from "@effect/schema/ParseResult";
import { Item } from "../models/Item";
import { TagFilter, TagFilters } from "../models/TagFilter";

const getItemFromId = (dbRef: DatabaseReference, itemId: number): Effect.Effect<Item, Error> => {

    const decodeItem = Schema.decodeUnknownEither(Item);
    const parseItem = (job: DataSnapshot) => {
        const itemE: Either.Either<Item, ParseError> = decodeItem(job.val()) 
        if(Either.isRight(itemE)) {
            return Effect.succeed(itemE.right)
        } else {
            return Effect.fail(itemE.left)
        }
    }

    const result = pipe(
      Effect.tryPromise(() => get(child(dbRef, `v0/item/${itemId}`))),
      Effect.flatMap(snapshot => snapshot.exists() ? parseItem(snapshot) : Effect.fail(new Error("No data")))
    );

    return result;
}

const getItemsFromIds = <T,>(dbRef: DatabaseReference, itemIdsHolder: Iterable<T>, itemIdExtractor: (itemIdHolder: T) => number): Effect.Effect<Item[], Error> => Effect.forEach(itemIdsHolder, (idHolder: T) => getItemFromId(dbRef, itemIdExtractor(idHolder)), { concurrency: "unbounded", batching: true});

const getItemsFromQueryId = (dbRef: DatabaseReference, queryItem: QueryChange): Effect.Effect<Item, Error> => getItemFromId(dbRef, queryItem.snapshot.val())
const getItemsFromQueryIds = (dbRef: DatabaseReference, itemIds: QueryChange[]): Effect.Effect<Item[], Error> => {
    return getItemsFromIds(dbRef, itemIds, idHolder => idHolder.snapshot.val())
}

const getKidItemsFromIds = (dbRef: DatabaseReference, kidsArray: number[][]) => Effect.all(
        kidsArray.map(itemKids => getItemsFromIds(dbRef, itemKids, x => x))
    )

const filterByRegexAny = (haystack: string | undefined, patterns: RegExp[]): boolean =>
    patterns
        .reduce<boolean>((acc, pattern) => acc || (haystack !== undefined && haystack.search(pattern) > -1), false)

const filterByRegex = (haystack: string | undefined, patterns: RegExp[]): boolean => {
    console.debug("haystack: ", haystack)
    console.debug("patterns: ", patterns)
    return patterns
        .reduce<boolean>((acc, pattern) => acc && (haystack !== undefined && haystack.search(pattern) > -1), true)
}

const replaceTagCaptureGroup = (tag: TagFilter) => TagFilter({name: tag.name, pattern: RegExp(tag.pattern.source.replace(/(\()([^(:?)].*\))/, "(:?$2"), tag.pattern.flags)})

const itemFilter = (items: Item[], tagFilters: TagFilter[], searchFilter: string | undefined = undefined, parentFilter: number | undefined = undefined, userFilter: string | undefined = undefined, filterFlagged: boolean = true) => {
    console.debug("items: ", items)
    try {
        return items
            .filter(item => item.id == item.id || parentFilter == parentFilter || filterFlagged == filterFlagged || tagFilters == tagFilters || searchFilter == searchFilter || true)
            .filter(item => 
                item.text !== undefined
                && item.text !== null
                && item.text != ""
                && item.detached !== true
                && !(filterFlagged && item.text?.toLowerCase().includes("[flagged]"))
                && !(filterFlagged && item.text?.toLowerCase().includes("[dead]"))
                && (filterFlagged && (item.dead !== undefined && item.dead !== null ? item.dead == false : true))
                && (parentFilter !== undefined && parentFilter !== null ? item.parent == parentFilter : true)
                && (userFilter !== undefined && userFilter !== null ? item.by == userFilter : true)
            )
            .filter(item => filterByRegex(item.text, tagFilters.map(tag => tag.pattern)))
            .filter(item => searchFilter !== undefined ? item.text?.includes(searchFilter) : true)
            .reverse()
    } catch (e) {
        console.debug(e)
        return []
    }
}

const flatFilters = (filters: Map<string, TagFilters>): TagFilter[] => Array.from(filters.values()).map(filterSet => Array.from(filterSet)).flat()

export { filterByRegex, filterByRegexAny, flatFilters, getItemFromId, getItemsFromIds, getItemsFromQueryId, getItemsFromQueryIds, getKidItemsFromIds, itemFilter, replaceTagCaptureGroup };

