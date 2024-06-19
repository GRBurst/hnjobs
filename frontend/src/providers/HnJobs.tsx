import { Schema } from "@effect/schema";
import { ParseError } from "@effect/schema/ParseResult";
import { Effect, Either, pipe } from "effect";
import { DatabaseReference, ref } from "firebase/database";
import { useDatabase, useDatabaseObjectData } from "reactfire";
import { Item, User } from "../models/Item";
import { getItemsFromIds } from "../utils/hn";

export const HnJobs = () => {
  const whoishiring = "whoishiring";

  const userRef = `v0/user/${whoishiring}`;

  const db = useDatabase();
  const dbRef = ref(useDatabase());
  const endpointRef = ref(db, userRef);

  // Status observable
  const { status: endpointStatus, data: userData } =
    useDatabaseObjectData<User>(endpointRef);

  // Get thread from user submits
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
};
