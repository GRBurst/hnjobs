import { useState, useEffect, useMemo } from 'react'
import axios from 'axios';
import {  Flex, List } from "antd";
import './HnJobs.css'
import { QueryChange } from 'rxfire/database';
import { pipe, Effect } from "effect"
import { HashSet as HSet } from "effect"
import type { HashSet } from "effect/HashSet"
import sanitizeHtml from 'sanitize-html';

// import { promises as fsPromises } from 'fs';


import { TagFilter, Tag as FilterTag } from "./components/TagFilter"
import Item from "./models/Item"

import { DatabaseProvider, useDatabase, useDatabaseList, useFirebaseApp  } from 'reactfire';
import { getDatabase, startAt, endAt, query, get, child, ref, onChildAdded, onChildChanged, onChildRemoved, onValue, DatabaseReference, DataSnapshot, limitToFirst } from "firebase/database";

// const asyncWriteFile = async (filename: string, data: string) => {
//     try {
//       await fsPromises.writeFile(filename, data, {
//         flag: 'w',
//       });
  
//       const contents = await fsPromises.readFile(
//         filename,
//         'utf-8',
//       );
//       console.log(contents.slice(0, 100));
  
//       return contents;
//     } catch (err) {
//       console.log(err);
//       return `Couldn't read / write file ${filename}`;
//     }
//   }
  

// Call api directly (without firebase)
const getCurrentHnJobPosts = async (): Promise<number[]> => {
    try {
        const response = await axios.get("https://hacker-news.firebaseio.com/v0/jobstories.json");
        const jobs = response.data
        console.log(`Jobs: ${jobs}`)
        return jobs
    } catch (error) {
        console.error(error);
    }
    return Promise.resolve([])
}

// Call api directly (without firebase)
const getCurrentAskHnJobPosts = async (): Promise<number[]> => {
    try {
        const response = await axios.get("https://hacker-news.firebaseio.com/v0/jobstories.json");
        const jobs = response.data
        console.log(`Jobs: ${jobs}`)
        return jobs

    } catch (error) {
        console.error(error);
    }
    return Promise.resolve([])
}

const writeComments = async (data: string): Promise<void> => axios.post("http://localhost:5179", data);

const getItemFromId = (dbRef: DatabaseReference, itemId: number): Effect.Effect<Item, Error> => {

    console.log(`itemId: ${itemId}`)
    const existsOption = (job: DataSnapshot) => job.exists() ? Effect.succeed(job.val()) : Effect.fail(new Error("No data"));

    const result = pipe(
      Effect.tryPromise(() => get(child(dbRef, `v0/item/${itemId}`))),
      Effect.flatMap(existsOption)
    );

    return result;
}

const getItemsFromIds = <T,>(dbRef: DatabaseReference, itemIdsHolder: Iterable<T>, itemIdExtractor: (itemIdHolder: T) => number): Effect.Effect<Item[], Error> => Effect.forEach(itemIdsHolder, (idHolder: T) => getItemFromId(dbRef, itemIdExtractor(idHolder)));

const getItemsFromQueryIds = (dbRef: DatabaseReference, itemIds: QueryChange[]): Effect.Effect<Item[], Error> => {
    return getItemsFromIds(dbRef, itemIds, idHolder => idHolder.snapshot.val())
}

const getKidItemsFromIds = (dbRef: DatabaseReference, kidsArray: number[][]) => Effect.all(
        kidsArray.map(itemKids => getItemsFromIds(dbRef, itemKids, x => x))
    )

function YcJobsList() {
    const [currentJobPosts, setCurrentJobPosts] = useState<Item[]>([])
    const [currentAskPosts, setCurrentAskPosts] = useState<Item[][]>([])
    const [activeFilters, setActiveFilters] = useState<HashSet<string>>(HSet.empty())
    const allFilterTags = HSet.fromIterable(["Remote", "Scala"])
    const db = useDatabase();
    const dbRef = ref(useDatabase());
    const jobsRef = ref(db, '/v0/jobstories');
    // const asksRef = ref(db, '/v0/askstories');
    const jobsQuery = query(jobsRef, limitToFirst(10))
    // const asksQuery = query(asksRef, startAt(50), endAt(100))

    const jobList = useDatabaseList(jobsQuery);
    // const askList = useDatabaseList(asksQuery);
    // console.log(dblist)

    const { status: jobStatus, data: allJobs } = jobList;
    // const { status: askStatus, data: allAsks } = askList;

    const jobsPostList = useMemo(() => (jobStatus === 'success') ? allJobs : [], [jobStatus, allJobs])
    // const asksPostList = useMemo(() => (askStatus === 'success') ? allAsks : [], [askStatus, allAsks])

    // const jobsPostList = useMemo(() => ["A", "B", C])
    const asksPostList = useMemo(() => [39894820], []) // hardcoded since it is not in the firebase api anymore

    useEffect(() => {
        Effect.runPromise(getItemsFromQueryIds(dbRef, jobsPostList))
            .then(jobs => {
                    console.log("jobs: ", jobs)
                    setCurrentJobPosts(jobs)
            })
    }, [dbRef, jobsPostList])

    useEffect(() => {
        Effect.runPromise(
            pipe(
                getItemsFromIds(dbRef, asksPostList, x => x),
                Effect.tap(asks => console.log("effect asks", asks)),
                Effect.map(asks => asks.filter((ask: Item) => ask.by == "whoishiring" && ask.title.toLowerCase().includes("who is hiring"))),
                Effect.tap(asks => console.log("filtered asks", asks)),
                Effect.map(asks => asks.map((ask: Item) => ask.kids ?? [])),
                Effect.tap(itemKids => console.log("mapped kids", itemKids)),
                Effect.flatMap(itemKids => getKidItemsFromIds(dbRef, itemKids)),
                Effect.tap(itemKids => console.log("combined kids", itemKids)),
                // Effect.map(asks => asks[0].filter(ask => Array.from(HSet.values(activeFilters)).reduce<boolean>((acc, ele) => acc && (ask.text != undefined && ask.text.includes(ele)), true)))
            ))
            .then((asks: Item[][]) => {
                console.log("asks: ", asks)
                setCurrentAskPosts(asks)
            })
            // .then(() => 
            //     // axios.post("http://localhost:5179/comments", {"data": currentAskPosts.flat().map(ask => ask.text).join(" ")})
            //     console.log(currentAskPosts)
            //     // asyncWriteFile("/tmp/comments.txt", "foobar")
            // )
    // }, [dbRef, asksPostList, activeFilters])
    }, [dbRef, asksPostList])
    
    return <>
            {<TagFilter 
                // tags={allFilterTags.map(tag => activeFilters.includes(tag) ? (new FilterTag(tag.name, isActive = true)) : tag)}
                allTags={allFilterTags}
                activeTags={allFilterTags.pipe(HSet.intersection(activeFilters))}
                onActive={(tagName: string) => setActiveFilters(HSet.fromIterable([...activeFilters, tagName]))}
                onInactive={(tagName: string) => setActiveFilters(activeFilters.pipe(HSet.filter(item => item !== tagName)))}
                />
            }
            <Flex gap="middle">
                <List
                    className="job-list"
                    itemLayout="horizontal"
                    dataSource={currentJobPosts}
                    renderItem={(job) => (
                        <List.Item key={job.id} className="job-list-item" >
                            {job.id}: {job.title}
                        </List.Item>
                    )} />
                <List
                    className="job-list"
                    itemLayout="horizontal"
                    // dataSource={currentAskPosts[0]}
                    dataSource={currentAskPosts[0]?.filter(ask => Array.from(HSet.values(activeFilters)).reduce<boolean>((acc, ele) => acc && (ask.text != undefined && ask.text.includes(ele)), true))}
                    renderItem={(ask) => (
                        <List.Item key={ask.id} className="job-list-item" >
                            <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(ask.text)}} />
                        </List.Item>
                    )} />
            </Flex>
        </>
}

function HnJobs() {
    const app = useFirebaseApp();
    const database = getDatabase(app);

    return (
        <DatabaseProvider sdk={database}>
            <h1>HackerNews Jobs 💥</h1>
            <YcJobsList />
        </DatabaseProvider>
    );
}

export default HnJobs
