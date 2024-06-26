import { Schema } from "@effect/schema";
import { ParseError } from "@effect/schema/ParseResult";
import { Effect, Either, Option, pipe } from "effect";

import { DatabaseReference, getDatabase, ref } from "firebase/database";
import { createContext, lazy, useMemo, useState } from "react";
import {
  DatabaseProvider,
  useDatabaseObjectData,
  useFirebaseApp,
} from "reactfire";

import { Tabs } from "antd";

import { HnJobCategory, HnJobs } from "../models/HnJobs";
import { Item, User } from "../models/Item";
import { TagFilters } from "../models/TagFilter";
import { getLastThreads, mapToCategories } from "../utils/hn";

const constructHnJobs = (threads: Either.Either<Item, ParseError>[]): HnJobs => {
  const foundCategories: Item[] = threads.flatMap((threadE) => {
    if (Either.isRight(threadE)) {
      return [threadE.right];
    } else {
      console.log("Not all job categories found: ", threadE.left);
      return [];
    }
  });
  return mapToCategories(foundCategories);
}

export const getWhoIsData = (): Effect.Effect<HnJobs, Error> => {

  const whoishiring = "whoishiring";
  const userRef = `v0/user/${whoishiring}`;

  const app = useFirebaseApp();
  const db = getDatabase(app);
  const dbRef = ref(db);
  const userEndpointRef = ref(db, userRef);

  // Status observable
  const { status: endpointStatus, data: userData } =
    useDatabaseObjectData<User>(userEndpointRef);

  if (endpointStatus !== "success") return Option.none()

  return pipe(
    getLastThreads(dbRef, userData),
    Effect.map(threads => constructHnJobs(threads))
  )


  // const foundCategories: HnJobCategory[] = Object.values(threads)
  //   .filter((category: Option.Option<HnJobCategory>) => Option.isSome(category))
  //   .map((c: Option.Some<HnJobCategory>) => c.value);

  // console.log("Found categories: ", foundCategories);
  // if (!foundCategories) return <></>;

  // const tabItems = foundCategories.map((category) => ({
  //   key: category.id.toString(),
  //   label: category.phrase,
  //   children: [<WhoIsHiring filterTags={filterTags} jobCategory={category} />],
  // }));
  // const content = foundCategories.map((category) => ({
  //   menuKey.map()
  //   <WhoIsHiring filterTags={filterTags} jobCategory={category}],
  // }));

  // return (
  //   <DatabaseProvider sdk={db}>
  //     <FilterContext.Provider value={filterTags}>
  //       {content}
  //     </FilterContext.Provider>
  //   </DatabaseProvider>
  // );
};

// export default WhoIsData;
