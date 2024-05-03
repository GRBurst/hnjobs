import { Item, AskHn } from "../models/Item"
import { pipe, Effect } from "effect"
import axios from 'axios'

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

export {writeComments, getComments}