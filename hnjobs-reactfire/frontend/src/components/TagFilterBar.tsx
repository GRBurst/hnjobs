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
    return isActive ? <Button type="primary" onClick={() => onActiveChange(tagFilter)}>{tagFilter.name}</Button> : <Button onClick={() => onActiveChange(tagFilter)}>{tagFilter.name}</Button>
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
    
    return <div style={{border: "1px solid blue"}}>
        <p>Active Filter</p>
        <Flex gap="middle">
            { [activeTags.pipe(HSet.map(tag => <TagButton key={tag.name} tagFilter={tag} isActive={true} onActiveChange={onInactive} />), HSet.values)] }
        </Flex>
        <p>Inactive Filter</p>
        <Flex gap="middle">
            { [HSet.difference(allTags, activeTags).pipe(HSet.map(tag => <TagButton key={tag.name} tagFilter={tag} isActive={false} onActiveChange={onActive} />), HSet.values)] }
        </Flex>
        </div>
}

export { TagFilterBar, TagButton }