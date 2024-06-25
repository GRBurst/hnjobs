import { Data, Effect, Option } from "effect";
import { Item } from "./Item";

export interface HnJobCategory {
    readonly id: number
    readonly label: string
    readonly phrase: string
    readonly thread: Option.Option<Item>
    receiveThread: Option.Option<() => Effect.Effect<Item[], Error>>
}
export const HnJobCategory = Data.case<HnJobCategory>()

export interface HnJobs {
    readonly whoIsHiring: Option.Option<HnJobCategory>
    readonly whoWantsHired: Option.Option<HnJobCategory>
    readonly whoFreelancer: Option.Option<HnJobCategory>
}
export const HnJobs = Data.case<HnJobs>()