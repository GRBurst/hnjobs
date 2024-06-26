import { pipe, Option } from "effect";
import { ReactNode, Fragment } from "react";


// function toReactNode<T>(this: Option.Option<T>): ReactNode {
//     return Option.isSome(this) ? <>this.get</> : <></>
// }

// declare global {
//     interface Option<T> {
//         toReactNode(): ReactNode
//     }
// }
// Option.prototype.toReactNode = toReactNode

// export const toReactNode = <T>(self: Option.Option<T>): Fragment => Option.getOrElse(<>self</>, () => <></>)
export function toReactNode<T>(self: Option.Option<T>): ReactNode {
    return Option.getOrElse(Option.map(self, <>self</>), () => <></>)
}

