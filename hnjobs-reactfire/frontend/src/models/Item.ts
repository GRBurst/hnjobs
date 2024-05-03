export interface Item {
  by: string,
  descendants: number,
  id: number,
  kids?: number[],
  score: number,
  time: number,
  title?: string,
  text?: string,
  type?: string,
  parent?: number,
  url: string
}

export interface AskHn {
  by: string,
  descendants: number,
  id: number,
  kids?: number[],
  score: number,
  time: number,
  title?: string,
  text?: string,
  type?: string,
  parent?: number,
  url: string
  comments: Item[]
}