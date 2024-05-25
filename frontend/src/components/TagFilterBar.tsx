import { CSSProperties, Fragment, ReactNode, useContext, useState } from 'react';
import { Collapse, Drawer, Flex, Button, FloatButton } from "antd";
import type { CollapseProps } from 'antd';
import { EditFilled, FilterTwoTone } from '@ant-design/icons';


import { CustomFilters } from './CustomFilters';
import { HashSet as HSet } from "effect";
import { TagFilter as TagF, TagFilters } from "../models/TagFilter";
import { AppConfig } from '../utils/config';
import { ConfigContext } from 'antd/es/config-provider';
import { flatFilters } from '../utils/hn';

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
    onActiveChange: () => { }
}

interface TagFilterProps {
    allTags: Map<string, TagFilters>
    activeTags: Map<string, TagFilters>
    onActive: (key: string, tag: TagF) => void
    onInactive: (key: string, tag: TagF) => void
    onTagAdd: (key: string, tag: TagF) => void
    onSearch: (needle: string | undefined) => void
}
const TagFilterDrawer = ({ allTags, activeTags, onActive, onInactive, onTagAdd, onSearch }: TagFilterProps) => {
    const [open, setOpen] = useState(false);
    const appContext = useContext(ConfigContext)
    const flatActive = flatFilters(activeTags)


    const tagSort = (t1: TagF, t2: TagF): number => {
        if (t1.name == "Remote") return -1
        if (t2.name == "Remote") return 1

        return (t1.name < t2.name) ? -1 : 1
    }

    const panelStyle: CSSProperties = { border: 'none' };

    const activeFiltersDisplay = <>
        <Flex wrap="wrap" gap="small" className="filter-list">
            {Array.from(activeTags.keys()).map((key) =>
                Array.from(activeTags.get(key) ?? []).length > 0 ? (
                    Array.from(activeTags.get(key) ?? HSet.empty()).sort(tagSort).map(tag =>
                        <TagButton key={key + tag.name} filterKey={key} tagFilter={tag} isActive={true} onActiveChange={onInactive} />)
                ) : <Fragment key={key}></Fragment>
            )}
        </Flex>
    </>

    const collapsableTagFilters: CollapseProps['items'] = (
        Array.from(allTags.keys()).map((tagKey) => (
            {
                key: tagKey,
                label: <h3 className="filter" key={`${tagKey}-header`}>{tagKey}</h3>,
                children: (
                    <Flex key={tagKey} wrap="wrap" gap="small" className="filter-list">
                        {Array.from(HSet.difference(allTags.get(tagKey) ?? HSet.empty(), activeTags.get(tagKey) ?? HSet.empty())).sort(tagSort).map(tag =>
                            <TagButton key={tagKey + tag.name} filterKey={tagKey} tagFilter={tag} isActive={false} onActiveChange={onActive} />)
                        }
                    </Flex>
                ),
                style: panelStyle
            }
        ))
    )

    const collapsableCustomFilter: CollapseProps['items'] = [
        {
            key: AppConfig.tagFilters.custom.sectionName,
            label: <h3 className="filter">{AppConfig.tagFilters.custom.name}</h3>,
            children: <CustomFilters onTagAdd={onTagAdd} onSearch={onSearch} />,
            style: panelStyle
        }
    ]

    return (<>
        <div className="filter-bar">
            <Flex gap={12}>
                <h3>Active Filters</h3>
                <EditFilled onClick={() => setOpen(true)} style={{ color: appContext.theme?.token?.colorPrimary }} />
            </Flex>
            {activeFiltersDisplay}
        </div>
        <Drawer title="Filters" size="large" onClose={() => setOpen(false)} open={open}>
            {activeFiltersDisplay}
            <div className="filter-bar">
                <Collapse accordion items={[...collapsableTagFilters, ...collapsableCustomFilter]} bordered={false} />
            </div>
        </Drawer>
        <FloatButton
            onClick={() => setOpen(true)}
            badge={{ count: flatActive.length }}
            tooltip={<div>Edit Filters</div>}
            icon={<FilterTwoTone twoToneColor={AppConfig.colors.primary} />}
        />
    </>)
}

export { TagButton, TagFilterDrawer }