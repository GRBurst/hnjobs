import { useMemo, useState } from "react";
import { Item } from "../models/Item";
import { getDbKids } from "../utils/persistence";
import { RowArray } from "sqlite-wasm-http/sqlite3.js";
import { FilterableJobList } from "./FilterableJobList";
import { TagFilters } from "../models/TagFilter";

export interface FilterableSqliteListProps {
  filterTags: Map<string, TagFilters>;
}
export const FilterableSqliteList = ({ filterTags }: FilterableSqliteListProps) => {
  const [allItems, setAllItems] = useState<readonly Item[]>([]);
  const [parentItemId, setParentItemId] = useState<number | undefined>(
    undefined
  );

  useMemo(() => {
    getDbKids().then((dbKids: RowArray[]) => {
      console.log("Using local data from hnjobs.db");
      const items: Item[] = dbKids.map((kid) => {
        const zipped = kid.columnNames.map((colName, colIdx) => [
          colName,
          kid.row[colIdx],
        ]);
        const item: Item = zipped.reduce(
          (accObj, obj) => ({
            ...accObj,
            ...{
              [obj[0] as string]: ["deleted", "dead"].includes(obj[0] as string)
                ? obj[1] == 1
                : obj[1],
            },
          }),
          {}
        ) as Item;
        return item;
      });
      console.log(items);
      setAllItems(items);
      setParentItemId(undefined);
    });
  }, []);

  return (
    <FilterableJobList
      items={[...allItems]}
      parentItemId={parentItemId}
      userId={undefined}
      filterTags={filterTags} />
  );
};

export default FilterableSqliteList;