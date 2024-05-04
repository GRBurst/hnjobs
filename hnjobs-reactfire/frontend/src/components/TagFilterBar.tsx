import { ReactNode } from 'react'
import { Flex, Button } from "antd"

import { HashSet as HSet } from "effect"
import type { HashSet } from "effect/HashSet"
import { TagFilter as TagF } from "../models/TagFilter"

interface TagProps {
    tagFilter: TagF
    isActive: boolean
    onActiveChange: (tag: TagF) => void
}

function TagButton({ tagFilter, isActive, onActiveChange }: TagProps): ReactNode {
    return <Button type={isActive ? "primary" : "default"} onClick={() => onActiveChange(tagFilter)}>{tagFilter.name}</Button>
}

TagButton.defaultProps = {
    isActive: false,
    onActiveChange: () => {}
}

interface TagFilterProps {
    allTags: HashSet<TagF>
    activeTags: HashSet<TagF>
    onActive: (tag: TagF) => void
    onInactive: (tag: TagF) => void
}

function TagFilterBar({allTags, activeTags, onActive, onInactive}: TagFilterProps) {
    const tagSort = (t1: TagF, t2: TagF) => t1.name < t2.name ? -1 : 1
    
    return <div className="filter-bar">
        <p>Active Filter</p>
        <Flex wrap="wrap" gap="small" className="filter-list">
            {Array.from(activeTags).sort(tagSort).map(tag => <TagButton key={tag.name} tagFilter={tag} isActive={true} onActiveChange={onInactive} />)}
        </Flex>
        <p>Inactive Filter</p>
        <Flex wrap="wrap" gap="small" className="filter-list">
            { Array.from(HSet.difference(allTags, activeTags)).sort(tagSort).map(tag => <TagButton key={tag.name} tagFilter={tag} isActive={false} onActiveChange={onActive} />) }
        </Flex>
        </div>
}

export { TagFilterBar, TagButton }