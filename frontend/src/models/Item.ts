import { Schema } from "@effect/schema"

export const Item = Schema.Struct({
  id: Schema.Number,
  time: Schema.Number,
  deleted: Schema.optional(Schema.Boolean),
  type: Schema.optional(Schema.String),
  by: Schema.optional(Schema.String),
  text: Schema.optional(Schema.String),
  dead: Schema.optional(Schema.Boolean),
  parent: Schema.optional(Schema.Number),
  poll: Schema.optional(Schema.String),
  kids: Schema.optional(Schema.Array(Schema.Number)),
  url: Schema.optional(Schema.String),
  score: Schema.optional(Schema.Number),
  title: Schema.optional(Schema.String),
  parts: Schema.optional(Schema.String),
  descendants: Schema.optional(Schema.Number),
  detached: Schema.optional(Schema.Boolean), // This is for ourselves
})
export type Item = typeof Item.Type


export const User = Schema.Struct({
  id: Schema.String,
  created: Schema.Number,
  karma: Schema.Number,
  about: Schema.optional(Schema.String),
  submitted: Schema.optional(Schema.Array(Schema.Number)),
  delay: Schema.optional(Schema.Number),
})
export type User = typeof User.Type


export const AskHn = Schema.Struct({
  id: Schema.Number,
  comments: Schema.Array(Item),
})
export type AskHn = typeof AskHn.Type