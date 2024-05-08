export interface Item {
  id: number,
  deleted?: boolean,
  type?: string,
  by?: string,
  time: number,
  text?: string,
  dead?: boolean,
  parent?: number,
  poll?: string,
  kids?: number[],
  url?: string
  score?: number,
  title?: string,
  parts?: string,
  descendants?: number,
}

export interface User {
  id: number,
  created: number,
  karma: number,
  about?: string,
  submitted?: number[],
  delay?: number,
}

export interface AskHn {
  id: number,
  comments: Item[]
}
