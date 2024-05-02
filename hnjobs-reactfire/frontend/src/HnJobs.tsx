import { pipe, Effect } from "effect"

import { HashSet as HSet } from "effect"

import './HnJobs.css';
import { FilterableOnlineMultiList } from "./components/FilterableJobList"
import { getKidItemsFromIds } from "./utils/hn";
import Item from "./models/Item"


import { DatabaseProvider, useFirebaseApp  } from 'reactfire';
import { getDatabase, DatabaseReference } from "firebase/database";


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
