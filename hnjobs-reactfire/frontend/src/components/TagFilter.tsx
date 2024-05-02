import { ReactNode } from 'react'
import { Flex, Button } from "antd"

import { HashSet as HSet } from "effect"
import type { HashSet } from "effect/HashSet"

interface TagProps {
    name: string
    isActive: boolean
    onActiveChange: (tag: string) => void
}

function Tag({ name, isActive, onActiveChange }: TagProps): ReactNode {
    return isActive ? <Button type="primary" onClick={() => onActiveChange(name)}>{name}</Button> : <Button onClick={() => onActiveChange(name)}>{name}</Button>
}

Tag.defaultProps = {
    isActive: false,
    onActiveChange: () => {}
}

interface TagFilterProps {
    allTags: HashSet<string>
    activeTags: HashSet<string>
    onActive: (tag: string) => void
    onInactive: (tag: string) => void
}

function TagFilter({allTags, activeTags, onActive, onInactive}: TagFilterProps) {
    
    return <div style={{border: "1px solid blue"}}>
        <p>Active Filter</p>
        <Flex gap="middle">
            { [activeTags.pipe(HSet.map(tagName => <Tag key={tagName} name={tagName} isActive={true} onActiveChange={onInactive} />), HSet.values)] }
        </Flex>
        <p>Inactive Filter</p>
        <Flex gap="middle">
            { [HSet.difference(allTags, activeTags).pipe(HSet.map(tagName => <Tag key={tagName} name={tagName} isActive={false} onActiveChange={onActive} />), HSet.values)] }
        </Flex>
        </div>
}

export { TagFilter, Tag }