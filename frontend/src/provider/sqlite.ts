import { Effect, Option, pipe } from "effect";
import { RowArray } from "sqlite-wasm-http/sqlite3.js";
import { HnJobCategory, HnJobs } from "../models/HnJobs";
import { Item } from "../models/Item";
import { getDbKids } from "../utils/persistence";

// const getData = (): Effect.Effect<HnJobs, Error> => pipe(
const getData = (): Effect.Effect<Item[], Error> => pipe(
    Effect.promise(() => getDbKids()),
    Effect.map((dbKids: RowArray[]) => 
      dbKids.map((kid) => { // Item[] = 
      console.log("Using local data from hnjobs.db");
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
      })
    )
)

const provide = () => HnJobs({
    whoWantsHired: Option.none(),
    whoFreelancer: Option.none(),
    whoIsHiring: Option.some(
          HnJobCategory({
            id: 0,
            label: "whoishiring",
            phrase: "Who is hiring?",
            thread: Option.none(),
            receiveThread: getData
          })
    ),
})