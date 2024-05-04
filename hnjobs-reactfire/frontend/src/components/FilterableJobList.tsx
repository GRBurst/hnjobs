import { useState, useMemo } from 'react'
import { List } from "antd";
import { Effect } from "effect"
import { HashSet } from "effect"
import sanitizeHtml from "sanitize-html"


import { useDatabase, useDatabaseList  } from 'reactfire'
import { QueryConstraint, query, ref, DatabaseReference } from "firebase/database"

import { TagFilterBar } from "./TagFilterBar"
import { CustomFilters } from './CustomFilters'
import { Item, AskHn } from "../models/Item"
import { TagFilters, TagFilter } from "../models/TagFilter"
import { getComments, writeComments } from '../utils/persistence'
import { filterByRegex, getItemsFromQueryIds, itemFilter } from '../utils/hn'

const getHighlightedText = (text: string | undefined, highlights: RegExp[]) => {
    if (highlights === undefined || highlights.length == 0 || text === undefined) {
        return text ?? ""
    }

    const parts = text.split(" ")

    const highlightedText = parts?.map((textWord, i) => 
        filterByRegex(textWord, highlights) ? `<mark key=${i} className="search-terms-highlight">${textWord}</mark>` : textWord
    ).join(" ")

    return highlightedText
}

interface ItemListProps {
    items : Item[]
    tagFilters: TagFilter[]
    searchFilter: string | undefined
    parentFilter: number | undefined
}
const ItemList = ({
    items, tagFilters, searchFilter, parentFilter
}: ItemListProps) => <List
        className="job-list"
        itemLayout="horizontal"
        dataSource={items ? itemFilter(items, tagFilters, searchFilter, parentFilter) : []}
        renderItem={(item) => {
            const highlightedText = getHighlightedText(sanitizeHtml(item.text ?? ""), searchFilter !== undefined ? [...tagFilters.map(f => f.pattern), RegExp(searchFilter)] : tagFilters.map(f => f.pattern))
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


interface FilterableListProps {
    items: Item[][]
    parentItem: number | undefined
    filterTags: TagFilters
}
const FilterableList = ({
    parentItem,
    items,
    filterTags
}: FilterableListProps) => {
    const [allTagFilters, setAllTagFilters] = useState<TagFilters>(filterTags)
    const [activeTagFilters, setActiveTagFilters] = useState<TagFilters>(HashSet.empty())
    const [searchFilter, setSearchFilter] = useState<string | undefined>(undefined)


    return (
        <>
            <CustomFilters
                onTagAdd={(tag: TagFilter) => setAllTagFilters(HashSet.fromIterable([...allTagFilters, tag]))}
                onSearch={(needle: string | undefined) => setSearchFilter(needle)}
            />
            <TagFilterBar 
                allTags={allTagFilters}
                activeTags={HashSet.intersection(allTagFilters, activeTagFilters)}
                onActive={(tag: TagFilter) => setActiveTagFilters(HashSet.fromIterable([...activeTagFilters, tag]))}
                onInactive={(tag: TagFilter) => setActiveTagFilters(HashSet.filter(activeTagFilters, item => item !== tag))}
                />
            <ItemList 
                items={itemFilter(items[0] ?? [], activeTagFilters, searchFilter)}
                tagFilters={Array.from(activeTagFilters)}
                searchFilter={searchFilter}
                parentFilter={parentItem}
            />
        </>
    )
}

                    
interface FilterableLocalListProps {
    filterTags: TagFilters
}
const FilterableLocalList = ({
    filterTags
}: FilterableLocalListProps) => {
    const [allItems, setAllItems] = useState<Item[][]>([[]])
    const [parentItem, setParentItem] = useState<number | undefined>(undefined)

    useMemo(() => {
        Effect.runPromise(getComments()).then((received: AskHn[]) => {
            setParentItem(received[0].id)
            setAllItems([received[0].comments])
        })
    }, [])

    return (
        <FilterableList
            parentItem={parentItem}
            items={allItems} 
            filterTags={filterTags} 
        />)
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
        <FilterableList
            parentItem={parentItem}
            items={allItems} 
            filterTags={filterTags} 
        />)
}
FilterableOnlineMultiList.defaultProps = {
    writeToFile: true
}

export { FilterableLocalList, FilterableOnlineMultiList }