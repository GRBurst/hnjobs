import { Effect, Either, pipe } from "effect";
import { useMemo, useState } from "react";
import { DatabaseReference, ref } from "firebase/database";
import {
  useDatabase,
  useDatabaseObjectData
} from "reactfire";
import { Spin } from "antd";
import { Item, User } from "../models/Item";
import { getItemsFromIds } from "../utils/hn";
import { Schema } from "@effect/schema";
import { ParseError } from "@effect/schema/ParseResult";
import { FilterableJobList } from "./FilterableJobList";
import { TagFilters } from "../models/TagFilter";

export interface WhoIsHiringProps {
  filterTags: Map<string, TagFilters>;
}
export const WhoIsHiring = ({ filterTags }: WhoIsHiringProps) => {
  const [thread, setThread] = useState<Item | undefined>(undefined);
  const [threadComments, setThreadComments] = useState<Item[]>([]);
  const whoishiring = "whoishiring";

  const userRef = `v0/user/${whoishiring}`;

  const db = useDatabase();
  const dbRef = ref(useDatabase());
  const endpointRef = ref(db, userRef);

  // Status observable
  const { status: endpointStatus, data: userData } = useDatabaseObjectData<User>(endpointRef);

  // Get thread from user submits
  const getLastThread = (askDbRef: DatabaseReference, user: User): Effect.Effect<Either.Either<Item, ParseError>, Error> => pipe(
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
    Effect.map((asks) => asks
      .filter((ask) => ask.title?.toLowerCase().includes("ask hn: who is hiring?")
      )
      .at(0)
    ),
    Effect.map(ask => Schema.decodeUnknownEither(Item)(ask))
  );

  const getThreadComments = (dbRef: DatabaseReference, ask: Item): Effect.Effect<Item[], Error> => pipe(
    Effect.succeed(ask),
    Effect.map((ask) => ask.kids ?? []),
    Effect.tap((askKids) => console.log("mapped kids", askKids)),
    Effect.flatMap((itemKids) => getItemsFromIds(dbRef, itemKids, (x) => x))
  );

  useMemo(() => {
    if (endpointStatus == "success") {
      Effect.runPromise(getLastThread(dbRef, userData)).then(thread => {
        if (Either.isRight(thread)) {
          setThread(thread.right);
        }
      });
    }
  }, [dbRef, endpointStatus, userData]);

  useMemo(() => {
    if (thread) {
      Effect.runPromise(getThreadComments(dbRef, thread)).then(comments => setThreadComments(comments));
    }
  }, [dbRef, thread]);

  if (endpointStatus == "loading") {
    return <Spin tip="Loading" size="large" style={{width: "100%", padding: "64px"}} />;
  }

  return (
    <FilterableJobList
      items={threadComments ?? []}
      parentItemId={thread?.id}
      userId={undefined}
      filterTags={filterTags} />
  );
}
export default WhoIsHiring;