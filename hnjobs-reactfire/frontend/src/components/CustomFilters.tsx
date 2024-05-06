import { useState } from 'react'

import { Button, Input, Space } from "antd"
import type { SearchProps } from "antd/es/input/Search"

import { TagFilter, TagFilterSimple } from "../models/TagFilter"
import { replaceTagCaptureGroup } from '../utils/hn'

interface CustomTagFilterProps {
    onTagAdd: (key: string, tag: TagFilter) => void
}
const CustomTagFilter = ({onTagAdd}: CustomTagFilterProps) => { 
    const [tagName, setTagName] = useState<string>("")
    const [tagPattern, setTagPattern] = useState<string>("")
    const [tagPatternFlags, setTagPatternFlags] = useState<string>("")

    const addNewTag = () => {
        if(tagName !== undefined && tagName != "") {
            const newTag = (tagPattern !== undefined && tagPattern != "") ? TagFilter({name: tagName, pattern: RegExp(tagPattern, tagPatternFlags)}) : TagFilterSimple(tagName)
            onTagAdd("Custom", replaceTagCaptureGroup(newTag))
            setTagName("")
            setTagPattern("")
        }
    }
    return (
        <Space.Compact>
            <Input
                placeholder="Tag Name"
                style={{ width: "20%" }}
                allowClear
                value={tagName}
                onPressEnter={addNewTag}
                onChange={(e) => setTagName(e.target.value)}
            />
            <Input
                placeholder="Optional RegEx Search Term"
                style={{ width: "55%" }}
                allowClear
                value={tagPattern}
                onPressEnter={addNewTag}
                onChange={(e) => setTagPattern(e.target.value)}
            />
            <Input
                placeholder="Flags"
                style={{ width: "15%" }}
                value={tagPatternFlags}
                onPressEnter={addNewTag}
                onChange={(e) => setTagPatternFlags(e.target.value)}
            />
            <Button style={{ width: "10%" }} onClick={addNewTag} type="primary">Add</Button>
        </Space.Compact>
    )
}

interface SearchFilterProps {
    onTextSearch: (needle: string | undefined) => void
}
const SearchFilter = ({onTextSearch}: SearchFilterProps) => { 
    const { Search } = Input;
    const onSearchInput: SearchProps['onSearch'] = (value) =>  {
        if(value.length >= 3) {
            onTextSearch(value)
        } else if (value.length == 0) {
            onTextSearch(undefined)
        }
    }

    return (
        <Search
            placeholder="input search text"
            allowClear
            onSearch={onSearchInput}
            onChange={(e) => {if(e.target.value.length >= 3) { onTextSearch(e.target.value)}}}
            enterButton
        />
    )
}

interface CustomFiltersProps {
    onTagAdd: (key: string, tag: TagFilter) => void
    onSearch: (needle: string | undefined) => void
}
const CustomFilters = ({onTagAdd, onSearch}: CustomFiltersProps) => {

    return (
        <>
            <CustomTagFilter onTagAdd={onTagAdd} />
            <SearchFilter onTextSearch={onSearch} />
        </>
    )
}

export { CustomFilters }