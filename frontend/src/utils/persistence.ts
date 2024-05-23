import axios from 'axios';
import { Effect, pipe } from "effect";
import { AskHn, Item } from "../models/Item";

import { createSQLiteHTTPPool } from 'sqlite-wasm-http';
import { RowArray } from 'sqlite-wasm-http/sqlite3.js';

const writeComments = (items: Item[][], onlyFirst = true): Effect.Effect<void, Error> => {
    if(items === undefined || items.length == 0){
        return Effect.succeed({})
    } 
    const comments: Item[] = onlyFirst ? items[0] : items.flat()
    const payload = JSON.stringify({
        "threads": [{
            "parent": 40224213, // TODO
            "comments": comments
        }]
    })
    return Effect.tryPromise(() => axios.post("http://localhost:5179/comments/", payload))
}

const getComments = (): Effect.Effect<AskHn[], Error> => pipe(
    Effect.tryPromise(() => axios.get("http://localhost:5179/comments/")),
    Effect.map((response) => JSON.parse(response.data["data"]).threads),
)


const getDbKids = async (): Promise<RowArray[]> => {
    const remoteURL = "/hnjobs.db"
    const pool = await createSQLiteHTTPPool({ workers: 8 });
    await pool.open(remoteURL);
    const kids = await pool.exec("SELECT * from item");
    await pool.close();
    return kids
}

export { getComments, getDbKids, writeComments };

