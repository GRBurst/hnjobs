import { pipe, Effect } from "effect"
import type { HashSet } from "effect/HashSet"

import { DatabaseProvider, useFirebaseApp  } from 'reactfire';
import { getDatabase, DatabaseReference } from "firebase/database";

import { FilterableLocalList, FilterableOnlineMultiList } from "./components/FilterableJobList"
import { getKidItemsFromIds } from "./utils/hn";
import { Item } from "./models/Item"
import { TagFilter } from "./models/TagFilter"
import { technologies, locations } from "./utils/predefined";



interface YcJobsListProps {
    local: boolean
}
const YcJobsList = ({local}: YcJobsListProps) => {
    const predefinedFilterTags = new Map<string,HashSet<TagFilter>>();
    predefinedFilterTags.set("Technologies", technologies)
    predefinedFilterTags.set("Locations", locations)


    //ids:
    // - 39894820 (april)
    // - 40224213 (may)
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
    // const askJobsProgram = (dbRef: DatabaseReference, initAsks: Effect.Effect<Item[], Error>): Effect.Effect<[Item, Item[]][], Error> => pipe(
    //         initAsks,
    //         Effect.tap((asks: Item[]) => console.log("effect asks", asks)),
    //         Effect.map(asks => asks.filter((ask: Item) => ask.by == "whoishiring" && ask.title?.toLowerCase().includes("who is hiring"))),
    //         Effect.tap(asks => console.log("filtered asks", asks)),
    //         Effect.map(asks => asks.map((ask: Item) => makeTuple(ask, ask.kids ?? []))), //Effect<Item[]> => Effect<[Item, number[]][]>
    //         Effect.tap(parentsWithKids => console.log("mapped kids", parentsWithKids)),
    //         Effect.flatMap(parentsWithKids => Traversable.sequence(
    //             // const res1: [Item, Effect.Effect<Item[], Error>][]  = parentsWithKids.map((parentWithKids: [Item, number[]]) => mapSecond(parentWithKids, (snd) => getItemsFromIds(dbRef, snd, x => x)))
    //             // const res2: Effect.Effect<[Item, Item[]][]> = Traversable.sequence(res1)
    //             // // Traversable.sequence(parentsWithKids, parentWithKids => mapSecond(parentWithKids, (snd) => getKidItemsFromIds(dbRef, snd)))
    //             // return res2
    //             parentsWithKids.map((parentWithKids: [Item, number[]]) => Traversable.sequence(mapSecond(parentWithKids, (snd) => getItemsFromIds(dbRef, snd, x => x))))
    //         )),
    //         Effect.tap(itemKids => console.log("combined kids", itemKids)),
    //     )
    
    return local ? <FilterableLocalList filterTags={predefinedFilterTags} /> : (<FilterableOnlineMultiList
            refEndpoint="/v0/askstories"
            queryConstraints={[]} // e.g. startAt(50), endAt(100)
            parentItem={40224213}
            receiveProgram={askJobsProgram}
            filterTags={predefinedFilterTags}
            writeToFile={true}
        />)
}

function HnJobs() {
    const app = useFirebaseApp();
    const database = getDatabase(app);

    return (
        <DatabaseProvider sdk={database}>
            <h1>HackerNews Jobs 💥</h1>
            <YcJobsList local={(import.meta.env.VITE_DATA_SOURCE == "online")}/>
        </DatabaseProvider>
    );
}

export default HnJobs
