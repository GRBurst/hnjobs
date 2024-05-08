import { CSSProperties, Fragment, ReactNode } from 'react'
import { Collapse, Flex, Button } from "antd"
import type { CollapseProps } from 'antd';


import { CustomFilters } from './CustomFilters'
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
    onTagAdd: (key: string, tag: TagF) => void
    onSearch: (needle: string | undefined) => void
}

function TagFilterBar({allTags, activeTags, onActive, onInactive, onTagAdd, onSearch}: TagFilterProps) {
    const tagSort = (t1: TagF, t2: TagF): number => {
        if(t1.name == "Remote") return -1
        if(t2.name == "Remote") return 1

        return (t1.name < t2.name) ? -1 : 1
    }
    
    const filterNonEmpty = Array.from(activeTags.keys()).reduce((acc, key) => acc || Array.from(activeTags.get(key) ?? []).length > 0, false)
    const panelStyle: CSSProperties = { border: 'none' };
    
    const activeFiltersDisplay = (filterNonEmpty) ? <>
        <h3>Active Filter</h3>
        <Flex wrap="wrap" gap="small" className="filter-list">
            {Array.from(activeTags.keys()).map((key) => 
                Array.from(activeTags.get(key) ?? []).length > 0 ? (
                    Array.from(activeTags.get(key) ?? HSet.empty()).sort(tagSort).map(tag => 
                            <TagButton key={key+tag.name} filterKey={key} tagFilter={tag} isActive={true} onActiveChange={onInactive} />)
                ) : <Fragment key={key}></Fragment>
            )}
        </Flex>
        </> : <></>

    const collapsableTagFilters: CollapseProps['items'] = (
        Array.from(allTags.keys()).map((tagKey) => (
            {
                key: tagKey,
                label: <h3 key={`${tagKey}-header`}>{tagKey}</h3>,
                children: (
                    <Flex key={tagKey} wrap="wrap" gap="small" className="filter-list">
                        { Array.from(HSet.difference(allTags.get(tagKey) ?? HSet.empty(), activeTags.get(tagKey) ?? HSet.empty())).sort(tagSort).map(tag => 
                            <TagButton key={tagKey+tag.name} filterKey={tagKey} tagFilter={tag} isActive={false} onActiveChange={onActive} />)
                        }
                    </Flex>
                ),
                style: panelStyle
            }
        ))
    )

    const collapsableCustomFilter: CollapseProps['items'] = [
            {
                key: "custom",
                label: <h3>Custom Filters</h3>,
                children: <CustomFilters onTagAdd={onTagAdd} onSearch={onSearch} />,
                style: panelStyle
            }
        ]
    
    return <div className="filter-bar">
        {activeFiltersDisplay}
        <Collapse items={[...collapsableTagFilters, ...collapsableCustomFilter]} bordered={false} />
        </div>
}

export { TagFilterBar, TagButton }