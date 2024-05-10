import { Data } from "effect"
import type { HashSet } from "effect/HashSet"


export interface TagFilter {
    readonly name: string
    readonly pattern: RegExp
}

export const TagFilter = Data.case<TagFilter>()
export const TagFilterSimple = (tagName: string) => TagFilter({name: tagName, pattern: RegExp(`(?:^|\\b|\\s)(?:${tagName})(?:$|\\b|\\s)`, "gmi")})



export type TagFilters = HashSet<TagFilter>
