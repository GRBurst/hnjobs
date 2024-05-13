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
    const remoteURL = "http://localhost:5173/hnjobs.db"
    const pool = await createSQLiteHTTPPool({ workers: 8 });
    await pool.open(remoteURL);
    const kids = await pool.exec("SELECT * from item");
    await pool.close();
    return kids
}



// const getDbKids = async () => {
//     // MBTiles is a common format for storing both vector and
//     // raster maps in an SQLite database
//     const remoteURL = "http://localhost:5173/hnjobs.db"
//     // createHttpBackend will autodetect if you can use SharedArrayBuffer or not
//     const httpBackend = createHttpBackend({
//         maxPageSize: 4096,    // this is the current default SQLite page size
//         timeout: 10000,       // 10s
//         cacheSize: 4096       // 4 MB
//     });
//     // Multiple DB workers can be created, all sharing the same backend cache
//     // db is a raw SQLite Promiser object as described here:
//     // https://sqlite.org/wasm/doc/trunk/api-worker1.md
//     const db = await createSQLiteThread({ http: httpBackend });
//     // This API is compatible with all SQLite VFS
//     await db('open', { filename: 'file:' + encodeURI(remoteURL), vfs: 'http' });
//     await db('exec', {
//     sql: 'SELECT * from kids',
//     callback: (msg) => {
//         if (msg.row) {
//         console.log(msg.columnNames);
//         console.log(msg.row);
//         } else {
//         console.log('end');
//         }
//     }
//     });
//     // This closes the DB connection
//     await db('close', {});
//     // This terminates the SQLite worker
//     db.close();
//     await httpBackend.close();
// }

export { getComments, getDbKids, writeComments };

