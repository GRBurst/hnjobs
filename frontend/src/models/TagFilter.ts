import { Data } from "effect"
import type { HashSet } from "effect/HashSet"


export interface TagFilter {
    readonly name: string
    readonly pattern: RegExp
}

export const TagFilter = Data.case<TagFilter>()
export const TagFilterSimple = (tagName: string) => TagFilter({name: tagName, pattern: RegExp(`(^|\\b|\\s)(${tagName})($|\\b|\\s)`, "gmi")})

export const tagFilterToString = (tag: TagFilter): string => JSON.stringify({
    name: tag.name,
    pattern: {
        source: tag.pattern.source,
        flags: tag.pattern.flags,
    }
})
export const tagFilterFromString = (tagStr: string): TagFilter => {
    const parsedJson = JSON.parse(tagStr)
    return TagFilter({name: parsedJson.name, pattern: RegExp(parsedJson.pattern.source, parsedJson.pattern.flags)})
}

export type TagFilters = HashSet<TagFilter>
