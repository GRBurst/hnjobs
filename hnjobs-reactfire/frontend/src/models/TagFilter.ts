import { Data } from "effect"
import type { HashSet } from "effect/HashSet"


export interface TagFilter {
    readonly name: string
    readonly pattern: RegExp
}

export const TagFilter = Data.case<TagFilter>()

export type TagFilters = HashSet<TagFilter>
