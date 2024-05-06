import { Fragment, ReactNode } from 'react'
import { Flex, Button } from "antd"

import { HashSet as HSet } from "effect"
import { TagFilter as TagF, TagFilters } from "../models/TagFilter"

interface TagProps {
    tagFilter: TagF
    filterKey: string
    isActive: boolean
    onActiveChange: (filterKey: string, tag: TagF) => void
}

function TagButton({ tagFilter, filterKey, isActive, onActiveChange }: TagProps): ReactNode {
    return <Button type={isActive ? "primary" : "default"} onClick={() => onActiveChange(filterKey, tagFilter)}>{tagFilter.name}</Button>
}

TagButton.defaultProps = {
    isActive: false,
    onActiveChange: () => {}
}

interface TagFilterProps {
    allTags: Map<string, TagFilters>
    activeTags: Map<string, TagFilters>
    onActive: (key: string, tag: TagF) => void
    onInactive: (key: string, tag: TagF) => void
}

function TagFilterBar({allTags, activeTags, onActive, onInactive}: TagFilterProps) {
    const tagSort = (t1: TagF, t2: TagF) => t1.name < t2.name ? -1 : 1
    
    return <div className="filter-bar">
        <p>Active Filter</p>
        {
            Array.from(activeTags.keys()).map((key) => 
                Array.from(activeTags.get(key) ?? []).length > 0 ? (
                    <Flex key={key} wrap="wrap" gap="small" className="filter-list">
                        {Array.from(activeTags.get(key) ?? HSet.empty()).sort(tagSort).map(tag => 
                            <TagButton key={key+tag.name} filterKey={key} tagFilter={tag} isActive={true} onActiveChange={onInactive} />)
                        }
                    </Flex>
                ) : <Fragment key={key}></Fragment>
            )
        }
        {
            Array.from(allTags.keys()).map((key) => 
                <Fragment key={`${key}-fragment`}>
                    <p key={`${key}-header`}>{key}</p>
                    <Flex key={key} wrap="wrap" gap="small" className="filter-list">
                        { Array.from(HSet.difference(allTags.get(key) ?? HSet.empty(), activeTags.get(key) ?? HSet.empty())).sort(tagSort).map(tag => 
                            <TagButton key={key+tag.name} filterKey={key} tagFilter={tag} isActive={false} onActiveChange={onActive} />)
                        }
                    </Flex>
                </Fragment>
            )

        }
        </div>
}

export { TagFilterBar, TagButton }