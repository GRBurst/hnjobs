import { useState, useMemo } from 'react'
import {  List } from "antd";
import { Effect } from "effect"
import { HashSet as HSet } from "effect"
import type { HashSet } from "effect/HashSet"
import sanitizeHtml from "sanitize-html"


import { useDatabase, useDatabaseList  } from 'reactfire'
import { QueryConstraint, query, ref, DatabaseReference } from "firebase/database"

import { TagFilter } from "../components/TagFilter"
import Item from "../models/Item"
import { getComments, writeComments } from '../utils/persistence'
import { getItemsFromQueryIds } from '../utils/hn'

const getHighlightedText = (text: string | undefined, highlights: string[]) => {
    if (highlights === undefined || highlights.length == 0 || text === undefined) {
        return text ?? ""
    }

    const regStr = `(${highlights.join("|")})`
    const parts = text.split(new RegExp(regStr, 'g'));

    console.log(regStr)
    console.log(parts)
    return (parts?.map((textWord, i) => 
            highlights.includes(textWord) ? `<mark key=${i} className="search-terms-highlight">${textWord}</mark>` : textWord
    ).join(""))
}

interface ItemListProps {
    items : Item[]
    filters: string[]
}
const ItemList = ({
    items, filters
}: ItemListProps) => <List
        className="job-list"
        itemLayout="horizontal"
        dataSource={items.filter(ele => ele.text !== undefined && ele.text != "")}
        renderItem={(item) => (
            <List.Item key={item.id} className="job-list-item" >
                <div dangerouslySetInnerHTML={{ __html: getHighlightedText(sanitizeHtml(item.text), filters)}} />
            </List.Item>
        )}
    />
                    
interface FilterableLocalListProps {
    filterTags: HashSet<string>
}
const FilterableLocalList = ({
    filterTags
}: FilterableLocalListProps) => {
    const [allItems, setAllItems] = useState<Item[][]>([[]])
    const [activeFilters, setActiveFilters] = useState<HashSet<string>>(HSet.empty())
    useMemo(() => {
        Effect.runPromise(getComments()).then((receivedItems: Item[]) => setAllItems([receivedItems]))
    }, [])
    return (
        <>
            <TagFilter 
                allTags={filterTags}
                activeTags={filterTags.pipe(HSet.intersection(activeFilters))}
                onActive={(tagName: string) => setActiveFilters(HSet.fromIterable([...activeFilters, tagName]))}
                onInactive={(tagName: string) => setActiveFilters(activeFilters.pipe(HSet.filter(item => item !== tagName)))}
                />
            <ItemList 
                items={allItems[0]?.filter(item => Array.from(HSet.values(activeFilters)).reduce<boolean>((acc, ele) => acc && (item.text != undefined && item.text.includes(ele)), true)).reverse()}
                filters={Array.from(activeFilters)}
            />
        </>
    )
}
 
interface FilterableOnlineMultiListProps {
    refEndpoint: string,
    queryConstraints: QueryConstraint[],
    receiveProgram: (dbRef: DatabaseReference, items: Effect.Effect<Item[], Error>) => Effect.Effect<Item[][], Error>,
    filterTags: HashSet<string>,
    writeToFile: boolean
}
const FilterableOnlineMultiList = ({
    refEndpoint,
    queryConstraints,
    receiveProgram,
    filterTags,
    writeToFile = false
}: FilterableOnlineMultiListProps) => {
    const [allItems, setAllItems] = useState<Item[][]>([[]])
    const [activeFilters, setActiveFilters] = useState<HashSet<string>>(HSet.empty())

    const db = useDatabase();
    const dbRef = ref(useDatabase());
    const endpointRef = ref(db, refEndpoint);
    const endpointQuery = query(endpointRef, ...queryConstraints)
    const endpointList = useDatabaseList(endpointQuery);

    const { status: endpointStatus, data: endpointItems } = endpointList;

    const itemList = useMemo(() => (endpointStatus === 'success') ? endpointItems : [], [endpointStatus, endpointItems])

    useMemo(() => {
        Effect.runPromise(receiveProgram(dbRef, getItemsFromQueryIds(dbRef, itemList)))
            .then(receivedItems => {
                    console.log("items: ", receivedItems)
                    setAllItems(receivedItems)
                    if(writeToFile) {
                        Effect.runPromise(writeComments(receivedItems))
                    }
            })
    }, [dbRef, itemList, receiveProgram, writeToFile])

        return (
            <>
                <TagFilter 
                    allTags={filterTags}
                    activeTags={filterTags.pipe(HSet.intersection(activeFilters))}
                    onActive={(tagName: string) => setActiveFilters(HSet.fromIterable([...activeFilters, tagName]))}
                    onInactive={(tagName: string) => setActiveFilters(activeFilters.pipe(HSet.filter(item => item !== tagName)))}
                    />
                <ItemList
                    items={allItems[0]?.filter(item => Array.from(HSet.values(activeFilters)).reduce<boolean>((acc, ele) => acc && (item.text != undefined && item.text.includes(ele)), true)).reverse()}
                    filters={Array.from(activeFilters)}
                />
            </>
        )

}
FilterableOnlineMultiList.defaultProps = {
    writeToFile: true
}

export { FilterableLocalList, FilterableOnlineMultiList }