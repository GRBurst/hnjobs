// @ts-expect-error: QueryChange is not exported correctly from rxfire/database
import { QueryChange } from "rxfire/database";

import { Data, Effect, Either, Option, pipe } from "effect";

import { DataSnapshot, DatabaseReference, child, get } from "firebase/database";

import { Schema } from "@effect/schema";
import { ParseError } from "@effect/schema/ParseResult";
import { HnJobCategory, HnJobs } from "../models/HnJobs";
import { Item, User } from "../models/Item";

const getItemFromId = (dbRef: DatabaseReference, itemId: number): Effect.Effect<Item, Error> => {

    const decodeItem = Schema.decodeUnknownEither(Item);
    const parseItem = (job: DataSnapshot) => {
        const itemE: Either.Either<Item, ParseError> = decodeItem(job.val()) 
        if(Either.isRight(itemE)) {
            return Effect.succeed(itemE.right)
        } else {
            return Effect.fail(itemE.left)
        }
    }

    const result = pipe(
      Effect.tryPromise(() => get(child(dbRef, `v0/item/${itemId}`))),
      Effect.flatMap(snapshot => snapshot.exists() ? parseItem(snapshot) : Effect.fail(new Error("No data")))
    );

    return result;
}

const getItemsFromIds = <T,>(dbRef: DatabaseReference, itemIdsHolder: Iterable<T>, itemIdExtractor: (itemIdHolder: T) => number): Effect.Effect<Item[], Error> => Effect.forEach(itemIdsHolder, (idHolder: T) => getItemFromId(dbRef, itemIdExtractor(idHolder)), { concurrency: "unbounded", batching: true});
// const getItemsFromIds = <T,>(dbRef: DatabaseReference, itemIdsHolder: Iterable<T>, itemIdExtractor: (itemIdHolder: T) => number): Effect.Effect<Item[], Error> => 
//     Effect.all(
//         Array.from(itemIdsHolder).map((idHolder: T) => getItemFromId(dbRef, itemIdExtractor(idHolder))),
//         { concurrency: "unbounded", batching: true}
//     );

const getItemsFromQueryId = (dbRef: DatabaseReference, queryItem: QueryChange): Effect.Effect<Item, Error> => getItemFromId(dbRef, queryItem.snapshot.val())
const getItemsFromQueryIds = (dbRef: DatabaseReference, itemIds: QueryChange[]): Effect.Effect<Item[], Error> => {
    return getItemsFromIds(dbRef, itemIds, idHolder => idHolder.snapshot.val())
}

const getKidItemsFromIds = (dbRef: DatabaseReference, kidsArray: number[][]) => Effect.all(
        kidsArray.map(itemKids => getItemsFromIds(dbRef, itemKids, x => x))
    )

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
  const whoIsHiring: Option.Option<Item> = Option.fromNullable(threads.find((thread) =>
    thread.title?.includes("Ask HN: Who is hiring?")
  ));
  const whoWantsHired: Option.Option<Item> = Option.fromNullable(threads.find((thread) =>
    thread.title?.includes("Ask HN: Who wants to be hired?")
  ));
  const whoFreelancer: Option.Option<Item> = Option.fromNullable(threads.find((thread) =>
    thread.title?.includes("Ask HN: Freelancer? Seeking freelancer?")
  ));
  return HnJobs({
    whoIsHiring: Option.map(whoIsHiring, isHiring =>
      HnJobCategory({
        id: isHiring.id,
        label: "whoishiring",
        phrase: "Who is hiring?",
        thread: whoIsHiring,
        receiveThread: Option.none()
      })
    ),
    whoWantsHired: Option.map(whoWantsHired, wantsHired =>
      HnJobCategory({
        id: wantsHired.id,
        label: "whowantshired",
        phrase: "Who wants to be hired?",
        thread: whoWantsHired,
        receiveThread: Option.none()
      })
    ),
    whoFreelancer: Option.map(whoFreelancer,
      freelancer =>
        HnJobCategory({
          id: freelancer.id,
          label: "whofreelancer",
          phrase: "Freelancer? Seeking freelancer?",
          thread: whoFreelancer,
          receiveThread: Option.none()
        })
    )
  });
}


const getHnCategories = (
  askDbRef: DatabaseReference,
  user: User
): Effect.Effect<HnJobs, Error> => pipe(
        getLastThreads(askDbRef, user),
        Effect.map((threads) => threads.flatMap((threadE) => {
            if (Either.isRight(threadE)) {
                return [threadE.right];
            } else {
                console.log("Not all job categories found: ", threadE.left);
                return [];
            }
            })),
        Effect.map(foundCategories => mapToCategories(foundCategories))
      )

export { enrichDetachedFlag, getHnCategories, getItemFromId, getItemsFromIds, getItemsFromQueryId, getItemsFromQueryIds, getKidItemsFromIds, getLastThreads, getThreadComments, mapToCategories };

