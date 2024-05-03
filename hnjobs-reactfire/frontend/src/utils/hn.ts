import { QueryChange } from "rxfire/database"
import { pipe, Effect } from "effect"

import { HashSet as HSet } from "effect"
import type { HashSet } from "effect/HashSet"

import { get, child, DatabaseReference, DataSnapshot } from "firebase/database";

import { Item } from "../models/Item"

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

const itemFilter = (items: Item[], tagFilters: Iterable<string>, parentFilter: number | undefined = undefined, filterFlagged: boolean = true) => items
    .filter(item => 
        item.text !== undefined
        && item.text != ""
        && !(filterFlagged && item.text?.toLocaleLowerCase().includes("[flagged]"))
        && parentFilter !== undefined ? item.parent == parentFilter : true
    )
    .filter(item => 
        Array.from(tagFilters)
            .reduce<boolean>((acc, ele) => acc && (item.text != undefined && item.text.includes(ele)), true)
    )
    .reverse()

        // Array.from(HSet.values(tagFilters))
        //     .reduce<boolean>((acc, ele) => acc && (item.text != undefined && item.text.includes(ele)), true)
export {getItemFromId, getItemsFromIds, getItemsFromQueryIds, getKidItemsFromIds, itemFilter}

