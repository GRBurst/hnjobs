import { useState } from 'react'

import { Button, Flex, Input, Space } from "antd"
import type { SearchProps } from "antd/es/input/Search"

import { TagFilter, TagFilterSimple } from "../models/TagFilter"
import { AppConfig } from '../utils/config'

interface CustomTagFilterProps {
    onTagAdd: (key: string, tag: TagFilter) => void
}
const CustomTagFilter = ({ onTagAdd }: CustomTagFilterProps) => {
    const [tagName, setTagName] = useState<string>("")
    const [tagPattern, setTagPattern] = useState<string>("")
    const [tagPatternFlags, setTagPatternFlags] = useState<string>("")

    const addNewTag = () => {
        if (tagName !== undefined && tagName != "") {
            const newFlags = (tagPatternFlags !== undefined && tagPatternFlags != "") ? tagPattern : "gmi"
            const newTag = (tagPattern !== undefined && tagPattern != "") ? TagFilter({ name: tagName, pattern: RegExp(tagPattern, newFlags) }) : TagFilterSimple(tagName)
            onTagAdd(AppConfig.tagFilters.custom.sectionName, newTag)
            setTagName("")
            setTagPattern("")
            setTagPatternFlags("")
        }
    }

    return (
        <Space.Compact>
            <Input
                placeholder="Tag Name*"
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
const SearchFilter = ({ onTextSearch }: SearchFilterProps) => {
    const { Search } = Input;
    const onSearchInput: SearchProps['onSearch'] = (value) => {
        if (value.length >= 3) {
            onTextSearch(value)
        } else if (value.length == 0) {
            onTextSearch(undefined)
        }
    }

    return (
        <Search
            placeholder="case-sensitve input search text"
            allowClear
            onSearch={onSearchInput}
            onChange={(e) => { if (e.target.value.length >= 3) { onTextSearch(e.target.value) } }}
            enterButton
        />
    )
}

interface CustomFiltersProps {
    onTagAdd: (key: string, tag: TagFilter) => void
    onSearch: (needle: string | undefined) => void
}
const CustomFilters = ({ onTagAdd, onSearch }: CustomFiltersProps) => {

    return (
        <Flex gap="middle" vertical>
            <p>Only simple regex without subgroup matching are supported. Including subgroups "(...)" might result in unexpected highlight behavior.</p>
            <CustomTagFilter onTagAdd={onTagAdd} />
            <SearchFilter onTextSearch={onSearch} />
        </Flex>
    )
}

export { CustomFilters }