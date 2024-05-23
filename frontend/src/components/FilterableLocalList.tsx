import { Either } from "effect";
import { useMemo, useState } from "react";
import { AskHn, Item } from "../models/Item";
import { Schema } from "@effect/schema";
import { ParseError } from "@effect/schema/ParseResult";
import axios from "axios";
import { FilterableJobList } from "./FilterableJobList";
import { TagFilters } from "../models/TagFilter";

export interface FilterableLocalListProps {
  filterTags: Map<string, TagFilters>;
}
export const FilterableLocalList = ({ filterTags }: FilterableLocalListProps) => {
  const [allItems, setAllItems] = useState<readonly Item[]>([]);
  const [parentItemId, setParentItemId] = useState<number | undefined>(
    undefined
  );

  useMemo(() => {
    console.log("Using local data from comments.json");
    axios.get("/hnjobs/comments.json").then((response) => {
      const decodeHn = Schema.decodeUnknownEither(AskHn);
      const current: Either.Either<AskHn, ParseError> = decodeHn(
        response.data.threads[0]
      );
      if (Either.isRight(current)) {
        setParentItemId(current.right.id);
        setAllItems(current.right.comments);
      }
    });
  }, []);

  return (
    <FilterableJobList
      items={[...allItems]}
      parentItemId={parentItemId}
      userId={undefined}
      filterTags={filterTags} />
  );
}

export default FilterableLocalList;
