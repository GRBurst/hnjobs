import { useState, useMemo } from 'react'
import { List } from "antd";
import { Effect } from "effect"
import { HashSet } from "effect"
import sanitizeHtml from "sanitize-html"


import { useDatabase, useDatabaseList  } from 'reactfire'
import { QueryConstraint, query, ref, DatabaseReference } from "firebase/database"

import { TagFilterBar } from "./TagFilterBar"
import { Item, AskHn } from "../models/Item"
import { TagFilters, TagFilter } from "../models/TagFilter"
import { getComments, writeComments } from '../utils/persistence'
import { getItemsFromQueryIds, itemFilter } from '../utils/hn'

const getHighlightedText = (text: string | undefined, highlights: string[]) => {
    if (highlights === undefined || highlights.length == 0 || text === undefined) {
        return text ?? ""
    }

    const regStr = `(${highlights.join("|")})`
    const parts = text.split(new RegExp(regStr, 'g'));

    console.log(regStr)
    console.log(parts)

    const highlightedText = parts?.map((textWord, i) => 
            highlights.includes(textWord) ? `<mark key=${i} className="search-terms-highlight">${textWord}</mark>` : textWord
    ).join("")

    // const firstLineIndex = highlightedText.indexOf("\n")
    // const firstLine = highlightedText.slice(0, firstLineIndex)
    // const followingLines = highlightedText.slice(firstLineIndex)
    // return `<strong>${firstLine}</strong>\n${followingLines}`
    return highlightedText
}

interface ItemListProps {
    items : Item[]
    tagFilters: TagFilter[]
    parentFilter: number | undefined
}
const ItemList = ({
    items, tagFilters: filters, parentFilter
}: ItemListProps) => <List
        className="job-list"
        itemLayout="horizontal"
        dataSource={items ? itemFilter(items, filters, parentFilter) : []}
        renderItem={(item) => {
            const highlightedText = getHighlightedText(sanitizeHtml(item.text ?? ""), filters.map(f => f.name))
            return (
                <List.Item key={item.id} className="job-list-item">
                    <div>
                        <div>{item.by} at {new Date(1000 * item.time).toLocaleString()}</div>
                        <div dangerouslySetInnerHTML={{ __html: highlightedText}} />
                    </div>
                </List.Item>
            )
        }}
    />
                    
interface FilterableLocalListProps {
    filterTags: TagFilters
}
const FilterableLocalList = ({
    filterTags
}: FilterableLocalListProps) => {
    const [allItems, setAllItems] = useState<Item[][]>([[]])
    const [parentItem, setParentItem] = useState<number | undefined>(undefined)
    const [activeFilters, setActiveFilters] = useState<TagFilters>(HashSet.empty())
    useMemo(() => {
        Effect.runPromise(getComments()).then((received: AskHn[]) => {
            setParentItem(received[0].id)
            setAllItems([received[0].comments])
        })
    }, [])
    return (
        <>
            <TagFilterBar 
                allTags={filterTags}
                activeTags={filterTags.pipe(HashSet.intersection(activeFilters))}
                onActive={(tag: TagFilter) => setActiveFilters(HashSet.fromIterable([...activeFilters, tag]))}
                onInactive={(tag: TagFilter) => setActiveFilters(activeFilters.pipe(HashSet.filter(item => item !== tag)))}
                />
            <ItemList 
                items={itemFilter(allItems[0] ?? [], activeFilters)}
                tagFilters={Array.from(activeFilters)}
                parentFilter={parentItem}
            />
        </>
    )
}
 
interface FilterableOnlineMultiListProps {
    refEndpoint: string,
    queryConstraints: QueryConstraint[],
    receiveProgram: (dbRef: DatabaseReference, items: Effect.Effect<Item[], Error>) => Effect.Effect<Item[][], Error>,
    filterTags: TagFilters,
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
    const [parentItem, setParentItem] = useState<number | undefined>(undefined)
    const [activeFilters, setActiveFilters] = useState<TagFilters>(HashSet.empty())

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
                <TagFilterBar 
                    allTags={filterTags}
                    activeTags={filterTags.pipe(HashSet.intersection(activeFilters))}
                    onActive={(tag: TagFilter) => setActiveFilters(HashSet.fromIterable([...activeFilters, tag]))}
                    onInactive={(tag: TagFilter) => setActiveFilters(activeFilters.pipe(HashSet.filter(item => item !== tag)))}
                    />
                <ItemList
                    items={itemFilter(allItems[0] ?? [], activeFilters)}
                    tagFilters={Array.from(activeFilters)}
                    parentFilter={undefined}
                />
            </>
        )

}
FilterableOnlineMultiList.defaultProps = {
    writeToFile: true
}

export { FilterableLocalList, FilterableOnlineMultiList }