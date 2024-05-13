import { Effect, pipe } from "effect";
import type { HashSet } from "effect/HashSet";
import { TagFilter, TagFilters } from "./models/TagFilter";

import { DatabaseReference, getDatabase, ref } from "firebase/database";
import {
  DatabaseProvider,
  useDatabase,
  useDatabaseObjectData,
  useFirebaseApp,
} from "reactfire";

import { useCallback, useMemo, useState } from "react";
import comments from "../assets/comments.json";
import { FilterableJobList } from "./components/FilterableJobList";
import { AskHn, Item, User } from "./models/Item";
import { getItemsFromIds } from "./utils/hn";
import { writeComments } from "./utils/persistence";
import { locations, technologies } from "./utils/predefined";

interface FilterableLocalListProps {
  filterTags: Map<string, TagFilters>;
}
const FilterableLocalList = ({ filterTags }: FilterableLocalListProps) => {
  const [allItems, setAllItems] = useState<Item[][]>([[]]);
  const [parentItem, setParentItem] = useState<number | undefined>(undefined);
  console.log("Using local data from comments.json");

  useMemo(() => {
    const current: AskHn[] = comments.threads;
    setParentItem(() => current[0].id);
    setAllItems(() => [current[0].comments]);
    // Effect.runPromise(getComments()).then((received: AskHn[]) => {
    //     setParentItem(received[0].id)
    //     setAllItems([received[0].comments])
    // })
  }, []);

  return (
    <FilterableJobList
      parentItem={parentItem}
      items={allItems[0] ?? []}
      filterTags={filterTags}
    />
  );
};

interface WhoIsHiringProps {
  filterTags: Map<string, TagFilters>;
}
const WhoIsHiring = ({ filterTags }: WhoIsHiringProps) => {
  const [allItems, setAllItems] = useState<Item[]>([]);
  const whoishiring = "whoishiring";

  const userRef = `v0/user/${whoishiring}`;

  const db = useDatabase();
  const dbRef = ref(useDatabase());
  const endpointRef = ref(db, userRef);

  const { status: endpointStatus, data: userData } =
    useDatabaseObjectData<User>(endpointRef);

  const threadProgram = useCallback(
    (askDbRef: DatabaseReference, user: User) =>
      pipe(
        getItemsFromIds(
          askDbRef,
          user.submitted?.slice(0, 3) ?? [],
          (n: number) => n
        ),
        Effect.tap(([whoIsHiring, freelancer, whoWantsHiring]) => {
          console.log(whoIsHiring.title);
          console.log(freelancer.title);
          console.log(whoWantsHiring.title);
        }),
        Effect.map((asks) =>
          asks
            .filter((ask) =>
              ask.title?.toLowerCase().includes("ask hn: who is hiring?")
            )
            .at(0)
        ),
        Effect.map((ask) => ask?.kids ?? []),
        Effect.tap((askKids) => console.log("mapped kids", askKids)),
        Effect.flatMap((itemKids) =>
          getItemsFromIds(dbRef, itemKids, (x) => x)
        ),
        Effect.tap((itemKids) => console.log("final kids", itemKids))
      ),
    [dbRef]
  );

  const receivedUser = useMemo(
    () => (endpointStatus == "success" ? userData : undefined),
    [endpointStatus, userData]
  );

  useMemo(() => {
    if (receivedUser) {
      Effect.runPromise(threadProgram(dbRef, receivedUser)).then(
        (receivedItems) => {
          console.log("items: ", receivedItems);
          setAllItems(receivedItems);
          writeComments([receivedItems]);
        }
      );
    }
  }, [dbRef, threadProgram, receivedUser]);

  return (
    <FilterableJobList
      parentItem={undefined}
      items={allItems ?? []}
      filterTags={filterTags}
    />
  );
};

function HnJobs() {
  const app = useFirebaseApp();
  const database = getDatabase(app);

  const predefinedFilterTags = new Map<string, HashSet<TagFilter>>();
  predefinedFilterTags.set("Technologies", technologies);
  predefinedFilterTags.set("Locations", locations);

  return (
    <>
      <DatabaseProvider sdk={database}>
        <h1>HackerNews Jobs 💥</h1>
        {import.meta.env.VITE_DATA_SOURCE == "local" ? (
          <FilterableLocalList filterTags={predefinedFilterTags} />
        ) : (
          <WhoIsHiring filterTags={predefinedFilterTags} />
        )}
      </DatabaseProvider>
    </>
  );
}

export default HnJobs;
