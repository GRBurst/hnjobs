import { useState } from 'react'

import { Button, Flex, TextField, Box } from "@radix-ui/themes";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
// import type { SearchProps } from "antd/es/input/Search"

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
        <Box>
            <TextField.Root
                placeholder="Tag Name"
                style={{ width: "20%" }}
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
            />
            <TextField.Root
                placeholder="Optional RegEx Search Term"
                style={{ width: "55%" }}
                value={tagPattern}
                onChange={(e) => setTagPattern(e.target.value)}
            />
            <TextField.Root
                placeholder="Flags"
                style={{ width: "15%" }}
                value={tagPatternFlags}
                onChange={(e) => setTagPatternFlags(e.target.value)}
            />
            <Button style={{ width: "10%" }} onClick={addNewTag}>Add</Button>
        </Box>
    )
}

interface SearchFilterProps {
    onTextSearch: (needle: string | undefined) => void
}
const SearchFilter = ({onTextSearch}: SearchFilterProps) => { 
    // const { Search } = Input;
    // const onSearchInput: SearchProps['onSearch'] = (value) =>  {
    //     if(value.length >= 3) {
    //         onTextSearch(value)
    //     } else if (value.length == 0) {
    //         onTextSearch(undefined)
    //     }
    // }

    return (
    <TextField.Root
        onChange={(e) => {if(e.target.value.length >= 3) { onTextSearch(e.target.value)}}}
        // onSearch={onSearchInput}
        placeholder="Search the posts…">
        <TextField.Slot>
        <MagnifyingGlassIcon height="16" width="16" />
        </TextField.Slot>
    </TextField.Root>  
    )
}

interface CustomFiltersProps {
    onTagAdd: (key: string, tag: TagFilter) => void
    onSearch: (needle: string | undefined) => void
}
const CustomFilters = ({onTagAdd, onSearch}: CustomFiltersProps) => {

    return (
        <Flex gap="middle" direction="row">
            <CustomTagFilter onTagAdd={onTagAdd} />
            <SearchFilter onTextSearch={onSearch} />
        </Flex>
    )
}

export { CustomFilters }