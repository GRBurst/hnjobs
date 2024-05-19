import { Effect, Either, pipe } from "effect";
import type { HashSet } from "effect/HashSet";
import { TagFilter, TagFilters } from "../models/TagFilter";

import { DatabaseReference, getDatabase, ref } from "firebase/database";
import {
  DatabaseProvider,
  useDatabase,
  useDatabaseObjectData,
  useFirebaseApp,
} from "reactfire";

import { useCallback, useMemo, useState } from "react";
import { AskHn, Item, User } from "../models/Item";
import { getItemsFromIds } from "../utils/hn";
import { getDbKids } from "../utils/persistence";

import { Schema } from "@effect/schema";
import { ParseError } from "@effect/schema/ParseResult";
import axios from "axios";
import { RowArray } from "sqlite-wasm-http/sqlite3.js";
import { locations, technologies } from "../utils/predefined";
import { FilterableJobList } from "./FilterableJobList";

interface FilterableLocalListProps {
  filterTags: Map<string, TagFilters>;
}
const FilterableLocalList = ({ filterTags }: FilterableLocalListProps) => {
  const [allItems, setAllItems] = useState<readonly Item[]>([]);
  const [parentItemId, setParentItemId] = useState<number | undefined>(
    undefined
  );

  useMemo(() => {
    console.log("Using local data from comments.json");
    axios.get("http://localhost:5173/comments.json").then((response) => {
      const decodeHn = Schema.decodeUnknownEither(AskHn);
      const current: Either.Either<AskHn, ParseError> = decodeHn(
        response.data.threads[0]
      );
      if (Either.isRight(current)) {
        setParentItemId(current.right.id);
        setAllItems(current.right.comments);
      }
    });
  }, []);

  return (
    <FilterableJobList
      items={[...allItems]}
      parentItemId={parentItemId}
      userId={undefined}
      filterTags={filterTags}
    />
  );
};

const FilterableSqliteList = ({ filterTags }: FilterableLocalListProps) => {
  const [allItems, setAllItems] = useState<readonly Item[]>([]);
  const [parentItemId, setParentItemId] = useState<number | undefined>(
    undefined
  );

  useMemo(() => {
    getDbKids().then((dbKids: RowArray[]) => {
      console.log("Using local data from hnjobs.db");
      const items: Item[] = dbKids.map((kid) => {
        const zipped = kid.columnNames.map((colName, colIdx) => [
          colName,
          kid.row[colIdx],
        ]);
        const item: Item = zipped.reduce(
          (accObj, obj) => ({
            ...accObj,
            ...{
              [obj[0] as string]: ["deleted", "dead"].includes(obj[0] as string)
                ? obj[1] == 1
                : obj[1],
            },
          }),
          {}
        ) as Item;
        return item;
      });
      console.log(items);
      setAllItems(items);
      setParentItemId(undefined);
    });
  }, []);

  return (
    <FilterableJobList
      items={[...allItems]}
      parentItemId={parentItemId}
      userId={undefined}
      filterTags={filterTags}
    />
  );
};

interface WhoIsHiringProps {
  filterTags: Map<string, TagFilters>;
}
const WhoIsHiring = ({ filterTags }: WhoIsHiringProps) => {
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [threadId, setThreadId] = useState<number | undefined>(undefined);
  const whoishiring = "whoishiring";

  const userRef = `v0/user/${whoishiring}`;

  const db = useDatabase();
  const dbRef = ref(useDatabase());
  const endpointRef = ref(db, userRef);

  const { status: endpointStatus, data: userData } =
    useDatabaseObjectData<User>(endpointRef);

  const threadProgram = useCallback(
    (askDbRef: DatabaseReference, user: User) => {
      let parentId: undefined | number = undefined // TODO: how is traverse impl in effect?
      return pipe(
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
        Effect.tap((ask) => parentId = ask?.id),
        Effect.map((ask) => ask?.kids ?? []),
        Effect.tap((askKids) => console.log("mapped kids", askKids)),
        Effect.flatMap((itemKids) => getItemsFromIds(dbRef, itemKids, (x) => x)),
        Effect.tap((itemKids) => console.log("final kids", itemKids)),
        Effect.map((finalKids) => ({"id": parentId, "comments": finalKids ?? []})),
        Effect.map((finalKids) => Schema.decodeUnknownEither(AskHn)(finalKids)),
      )
    },
    [dbRef]
  );

  const receivedUser = useMemo(
    () => (endpointStatus == "success" ? userData : undefined),
    [endpointStatus, userData]
  );

  useMemo(() => {
    if (receivedUser) {
      Effect.runPromise(threadProgram(dbRef, receivedUser)).then(
        (askHn) => {
          console.log("askHn: ", askHn);
          if(Either.isRight(askHn)) {
            setAllItems([...askHn.right.comments]);
            setThreadId(askHn.right.id)
            // writeComments([[...askHn.right.comments]]);
          }
        }
      );
    }
  }, [dbRef, threadProgram, receivedUser]);

  return (
    <FilterableJobList
      items={allItems ?? []}
      parentItemId={threadId}
      userId={undefined}
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

  const getList = (source: string): JSX.Element => {
    if (source == "local") {
      return <FilterableLocalList filterTags={predefinedFilterTags} />;
    } else if (source == "sqlite") {
      return <FilterableSqliteList filterTags={predefinedFilterTags} />;
    } else {
      return <WhoIsHiring filterTags={predefinedFilterTags} />;
    }
  };

  return (
    <>
      <DatabaseProvider sdk={database}>
        <h1>HackerNews Jobs 🚀</h1>
        {getList(import.meta.env.VITE_DATA_SOURCE)}
      </DatabaseProvider>
    </>
  );
}

export default HnJobs;
