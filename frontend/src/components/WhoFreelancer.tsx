import { Data, Effect, pipe } from "effect";
import { DatabaseReference, ref } from "firebase/database";
import { useMemo, useState } from "react";
import { useDatabase } from "reactfire";
import { Item } from "../models/Item";
import { TagFilters } from "../models/TagFilter";
import { getItemsFromIds } from "../utils/hn";
import { FilterableJobList } from "./FilterableJobList";

export interface WhoIsHiringProps {
  filterTags: Map<string, TagFilters>;
  thread: Item;
}
export const WhoIsHiring = ({ filterTags, thread }: WhoIsHiringProps) => {
  const [threadComments, setThreadComments] = useState<Item[] | undefined>(
    undefined
  );
  const whoishiring = "whoishiring";
  const titlePhrase = "Ask HN: Freelancer? Seeking freelancer?".toLowerCase();
  // Ask HN: Freelancer? Seeking freelancer?
  // Ask HN: Who wants to be hired?
  // Ask HN: Who is hiring?

  const dbRef = ref(useDatabase());

  const getThreadComments = (
    dbRef: DatabaseReference,
    ask: Item
  ): Effect.Effect<Item[], Error> =>
    pipe(
      Effect.succeed(ask),
      Effect.map((ask) => ask.kids ?? []),
      Effect.tap((askKids) => console.log("mapped kids", askKids)),
      Effect.flatMap((itemKids) => getItemsFromIds(dbRef, itemKids, (i) => i))
    );

  const enrichDetachedFlag = (
    dbRef: DatabaseReference,
    comments: Item[]
  ): Effect.Effect<Item[], Error> => {
    const moderatorId = "dang";
    const filterSubstring = "We detached this";
    const Item = Data.case<Item>();

    const program = Effect.gen(function* () {
      const lookupMap = new Map();

      const commentsKids: number[] = comments.map((c) => c.kids ?? []).flat();
      const commentsKidsItems = yield* getItemsFromIds(
        dbRef,
        commentsKids,
        (c) => c
      );
      commentsKidsItems.forEach((c) => lookupMap.set(c.id, c));

      const enriched = comments.map((c) => {
        const isDetached =
          c.kids
            ?.map((kid) => lookupMap.get(kid))
            .some(
              (k) => k.by === moderatorId && k.text?.includes(filterSubstring)
            ) || false;
        return Item({ ...c, ...{ detached: isDetached } });
      });

      return enriched;
    });

    return program;
  };

  useMemo(() => {
    Effect.runPromise(
      pipe(
        getThreadComments(dbRef, thread),
        Effect.flatMap((comments) => enrichDetachedFlag(dbRef, comments))
      )
    ).then((comments) => setThreadComments(comments));
  }, [dbRef, thread]);

  return (
    <FilterableJobList
      items={threadComments}
      parentItemId={thread?.id}
      userId={undefined}
      filterTags={filterTags}
    />
  );
};
export default WhoIsHiring;
