import { useState, useMemo } from 'react'
import axios from 'axios';
import {  List } from "antd";
import { QueryChange } from "rxfire/database";
import { pipe, Effect } from "effect"
import { HashSet as HSet } from "effect"
import type { HashSet } from "effect/HashSet"
import sanitizeHtml from "sanitize-html";

import './HnJobs.css';

import { TagFilter } from "./components/TagFilter"
import Item from "./models/Item"

import { DatabaseProvider, useDatabase, useDatabaseList, useFirebaseApp  } from 'reactfire';
import { getDatabase, QueryConstraint, query, get, child, ref, DatabaseReference, DataSnapshot } from "firebase/database";

const writeComments = (items: Item[][], onlyFirst = true): Effect.Effect<void, Error> => {
    const itemData: Item[] = onlyFirst ? items[0] : items.flat()
    const data = itemData.map(item => item.text).join("~~~---~~~")
    return Effect.tryPromise(() => axios.post("http://localhost:5179/comments/", data))
}

const getComments = (): Effect.Effect<Item[], Error> => pipe(
    Effect.tryPromise(() => axios.get("http://localhost:5179/comments/")),
    Effect.tap((response) => console.log("Mock response: ", response.data)),
    Effect.map((response) => response.data["data"].join("").split("~~~---~~~")),
    Effect.map((comments: string[]) => comments.map<Item>(commentText => { return {
        text: commentText,
        by: "mock",
        descendants: 0,
        id: Math.random() * 1000000,
        score: 0,
        time: 0,
        url: "http://localhost"
    }}))
)

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

interface ItemListProps {
    items : Item[]
}
const ItemList = ({
    items
}: ItemListProps) => <List
        className="job-list"
        itemLayout="horizontal"
        dataSource={items}
        renderItem={(item) => (
            <List.Item key={item.id} className="job-list-item" >
                <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.text)}} />
            </List.Item>
        )}
    />
                    
interface FilterableLocalListProps {
    filterTags: HashSet<string>
}
const FilterableLocalList = ({
    filterTags
}: FilterableLocalListProps) => {
    const [allItems, setAllItems] = useState<Item[][]>([[]])
    const [activeFilters, setActiveFilters] = useState<HashSet<string>>(HSet.empty())
    useMemo(() => {
        Effect.runPromise(getComments()).then((receivedItems: Item[]) => setAllItems([receivedItems]))
    }, [])
    return (
        <>
            <TagFilter 
                allTags={filterTags}
                activeTags={filterTags.pipe(HSet.intersection(activeFilters))}
                onActive={(tagName: string) => setActiveFilters(HSet.fromIterable([...activeFilters, tagName]))}
                onInactive={(tagName: string) => setActiveFilters(activeFilters.pipe(HSet.filter(item => item !== tagName)))}
                />
            <ItemList items={allItems[0]?.filter(item => Array.from(HSet.values(activeFilters)).reduce<boolean>((acc, ele) => acc && (item.text != undefined && item.text.includes(ele)), true)).reverse()} />
        </>
    )
}
 
interface FilterableOnlineMultiListProps {
    refEndpoint: string,
    queryConstraints: QueryConstraint[],
    receiveProgram: (dbRef: DatabaseReference, items: Effect.Effect<Item[], Error>) => Effect.Effect<Item[][], Error>,
    filterTags: HashSet<string>,
    writeToFile: boolean
}
const FilterableOnlineMultiList = ({
    refEndpoint,
    queryConstraints,
    receiveProgram,
    filterTags,
    writeToFile = false
}: FilterableOnlineMultiListProps) => {
    const [allItems, setAllItems] = useState<Item[][]>([[]])
    const [activeFilters, setActiveFilters] = useState<HashSet<string>>(HSet.empty())

    const db = useDatabase();
    const dbRef = ref(useDatabase());
    const endpointRef = ref(db, refEndpoint);
    const endpointQuery = query(endpointRef, ...queryConstraints)
    const endpointList = useDatabaseList(endpointQuery);

    const { status: endpointStatus, data: endpointItems } = endpointList;

    const itemList = useMemo(() => (endpointStatus === 'success') ? endpointItems : [], [endpointStatus, endpointItems])

    useMemo(() => {
        Effect.runPromise(receiveProgram(dbRef, getItemsFromQueryIds(dbRef, itemList)))
            .then(receivedItems => {
                    console.log("items: ", receivedItems)
                    setAllItems(receivedItems)
                    if(writeToFile) {
                        writeComments(receivedItems)
                    }
            })
    }, [dbRef, itemList, receiveProgram, writeToFile])

        return (
            <>
                <TagFilter 
                    allTags={filterTags}
                    activeTags={filterTags.pipe(HSet.intersection(activeFilters))}
                    onActive={(tagName: string) => setActiveFilters(HSet.fromIterable([...activeFilters, tagName]))}
                    onInactive={(tagName: string) => setActiveFilters(activeFilters.pipe(HSet.filter(item => item !== tagName)))}
                    />
                <ItemList items={allItems[0]?.filter(item => Array.from(HSet.values(activeFilters)).reduce<boolean>((acc, ele) => acc && (item.text != undefined && item.text.includes(ele)), true)).reverse()} />
            </>
        )

}
FilterableOnlineMultiList.defaultProps = {
    writeToFile: true
}

const YcJobsList = () => {
    const allFilterTags = HSet.fromIterable(["Remote", "Scala", "Haskell", "Kubernetes"])

    //ids:
    // - 39894820 (april)
    // -40224213 (may)
    // hardcode if it is not in the firebase api anymore
    // e.g. use getItemsFromIds(dbRef, [39894820], x => x),
    const askJobsProgram = (dbRef: DatabaseReference, initAsks: Effect.Effect<Item[], Error>): Effect.Effect<Item[][], Error> => pipe(
            initAsks,
            Effect.tap((asks: Item[]) => console.log("effect asks", asks)),
            Effect.map(asks => asks.filter((ask: Item) => ask.by == "whoishiring" && ask.title?.toLowerCase().includes("who is hiring"))),
            Effect.tap(asks => console.log("filtered asks", asks)),
            Effect.map(asks => asks.map((ask: Item) => ask.kids ?? [])),
            Effect.tap(itemKids => console.log("mapped kids", itemKids)),
            Effect.flatMap(itemKids => getKidItemsFromIds(dbRef, itemKids)),
            Effect.tap(itemKids => console.log("combined kids", itemKids)),
        )
    
    return <FilterableOnlineMultiList
            refEndpoint="/v0/askstories"
            queryConstraints={[]} // startAt(50), endAt(100)
            receiveProgram={askJobsProgram}
            filterTags={allFilterTags}
        />
}

function HnJobs() {
    const app = useFirebaseApp();
    const database = getDatabase(app);

    return (
        <DatabaseProvider sdk={database}>
            <h1>HackerNews Jobs 💥</h1>
            <YcJobsList />
        </DatabaseProvider>
    );
}

export default HnJobs
