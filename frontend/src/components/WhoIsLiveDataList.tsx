import { Schema } from "@effect/schema";
import { ParseError } from "@effect/schema/ParseResult";
import { Effect, Either, Option, pipe } from "effect";

import { DatabaseReference, getDatabase, ref } from "firebase/database";
import { lazy, useMemo, useState } from "react";
import {
  DatabaseProvider,
  useDatabaseObjectData,
  useFirebaseApp,
} from "reactfire";

import { Tabs } from "antd";

import { HnJobCategory, HnJobs } from "../models/HnJobs";
import { Item, User } from "../models/Item";
import { TagFilters } from "../models/TagFilter";
import { getItemsFromIds } from "../utils/hn";

const WhoIsHiring = lazy(() => import("./WhoIsHiring"));

const getLastThreads = (
  askDbRef: DatabaseReference,
  user: User
): Effect.Effect<Either.Either<Item, ParseError>[], Error> =>
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
      asks.map((ask) => Schema.decodeUnknownEither(Item)(ask))
    )
  );

// Ask HN: Who is hiring?
// Ask HN: Who wants to be hired?
// Ask HN: Freelancer? Seeking freelancer?
const mapToCategories = (threads: Item[]): HnJobs => {
  const whoIsHiring: Item | undefined = threads.find((thread) =>
    thread.title?.includes("Ask HN: Who is hiring?")
  );
  const whoWantsHired: Item | undefined = threads.find((thread) =>
    thread.title?.includes("Ask HN: Who wants to be hired?")
  );
  const whoFreelancer: Item | undefined = threads.find((thread) =>
    thread.title?.includes("Ask HN: Freelancer? Seeking freelancer?")
  );
  return HnJobs({
    whoIsHiring: whoIsHiring
      ? Option.some(
          HnJobCategory({
            id: whoIsHiring.id,
            label: "whoishiring",
            phrase: "Who is hiring?",
            thread: whoIsHiring,
          })
        )
      : Option.none(),
    whoWantsHired: whoWantsHired
      ? Option.some(
          HnJobCategory({
            id: whoWantsHired.id,
            label: "whowantshired",
            phrase: "Who wants to be hired?",
            thread: whoWantsHired,
          })
        )
      : Option.none(),
    whoFreelancer: whoFreelancer
      ? Option.some(
          HnJobCategory({
            id: whoFreelancer.id,
            label: "whofreelancer",
            phrase: "Freelancer? Seeking freelancer?",
            thread: whoFreelancer,
          })
        )
      : Option.none(),
  });
};

export interface WhoIsDataProps {
  filterTags: Map<string, TagFilters>;
}
export const WhoIsData = ({ filterTags }: WhoIsDataProps) => {
  const [threads, setThreads] = useState<HnJobs | undefined>(undefined);

  const whoishiring = "whoishiring";
  const userRef = `v0/user/${whoishiring}`;

  const app = useFirebaseApp();
  const db = getDatabase(app);
  const dbRef = ref(db);
  const userEndpointRef = ref(db, userRef);

  // Status observable
  const { status: endpointStatus, data: userData } =
    useDatabaseObjectData<User>(userEndpointRef);

  useMemo(() => {
    if (endpointStatus == "success") {
      Effect.runPromise(getLastThreads(dbRef, userData)).then((threads) => {
        const foundCategories: Item[] = threads.flatMap((threadE) => {
          if (Either.isRight(threadE)) {
            return [threadE.right];
          } else {
            console.log("Not all job categories found: ", threadE.left);
            return [];
          }
        });
        setThreads(mapToCategories(foundCategories));
      });
    }
  }, [dbRef, endpointStatus, userData]);

  if (!threads) return <></>;

  const foundCategories: HnJobCategory[] = Object.values(threads)
    .filter((category: Option.Option<HnJobCategory>) => Option.isSome(category))
    .map((c: Option.Some<HnJobCategory>) => c.value);

  console.log("Found categories: ", foundCategories);
  if (!foundCategories) return <></>;

  const tabItems = foundCategories.map((category) => ({
    key: category.id.toString(),
    label: category.phrase,
    children: [<WhoIsHiring filterTags={filterTags} jobCategory={category} />],
  }));

  return (
    <DatabaseProvider sdk={db}>
      <Tabs tabPosition="left" items={tabItems} />
    </DatabaseProvider>
  );
};

export default WhoIsData;
