import { useState, useEffect, useMemo } from 'react'
import axios from 'axios';
import {  List } from "antd";
import { Flex } from "antd";
import { Col, Row } from "antd";
import './HnJobs.css'
import { QueryChange } from 'rxfire/database';
import { pipe, Effect, Array } from "effect"

import Item from ".models/Item"

import { DatabaseProvider, useDatabase, useDatabaseList, useFirebaseApp  } from 'reactfire';
import { getDatabase, startAt, endAt, query, get, child, ref, onChildAdded, onChildChanged, onChildRemoved, onValue, DatabaseReference, DataSnapshot, limitToFirst } from "firebase/database";

// Call api directly (without firebase)
async function getCurrentHnJobPosts(): Promise<number[]> {
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
async function getCurrentAskHnJobPosts(): Promise<number[]> {
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

function getItemFromId(dbRef: DatabaseReference, itemId: number): Effect.Effect<Item, Error> {

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

const getKidIdsFromItems = (dbRef: DatabaseReference, kidsArray: number[][]) => Effect.all(
        kidsArray.map(itemKids => getItemsFromIds(dbRef, itemKids, x => x))
    )

function YcJobsList() {
    const [currentJobPosts, setCurrentJobPosts] = useState<Item[]>([])
    const [currentAskPosts, setCurrentAskPosts] = useState<Item[][]>([])
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
    const asksPostList = useMemo(() => [39894820], [])

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
                Effect.tap(asks => console.log("effect asks", asks)), // Array.filterMap(((ask) => ask.by == "whoishiring" && ask.title.toLowerCase().includes("who is hiring")))
                Effect.map(asks => asks.filter((ask: Item) => ask.by == "whoishiring" && ask.title.toLowerCase().includes("who is hiring"))),
                Effect.tap(asks => console.log("filtered asks", asks)),
                Effect.map(asks => asks.map((ask: Item) => ask.kids?.slice(0, 10))),
                Effect.tap(itemKids => console.log("mapped kids", itemKids)),
                Effect.flatMap(itemKids => getKidIdsFromItems(dbRef, itemKids)),
                Effect.tap(itemKids => console.log("combined kids", itemKids)),
            ))
            .then((asks: Item[][]) => {
                console.log("asks: ", asks)
                setCurrentAskPosts(asks)
            })
    }, [dbRef, asksPostList])
    
    return <Flex gap="middle">
            <List
                className="job-list"
                itemLayout="horizontal"
                dataSource={currentJobPosts}
                renderItem={(job) => (
                    <List.Item key={job.id} className="job-list-item" >
                        {job.id}: {job.title},<br />
                        {JSON.stringify({job})}
                    </List.Item>
                )} />
            <List
                className="job-list"
                itemLayout="horizontal"
                dataSource={currentAskPosts[0]}
                renderItem={(ask) => (
                    <List.Item className="job-list-item" >
                            {ask.id}: {ask.text},<br />
                    </List.Item>
                )} />
        </Flex>
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
