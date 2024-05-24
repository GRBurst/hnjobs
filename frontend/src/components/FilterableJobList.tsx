import { List } from "antd";
import { HashSet } from "effect";
import { useState } from "react";
import sanitizeHtml from "sanitize-html";

import { Item } from "../models/Item";
import { TagFilter, TagFilters, tagFilterToString } from "../models/TagFilter";
import { filterByRegexAny, flatFilters, itemFilter } from "../utils/hn";
import { TagFilterBar } from "./TagFilterBar";

const getHighlightedText = (
  text: string | undefined,
  highlights: TagFilter[]
) => {
  if (
    highlights === undefined ||
    highlights.length == 0 ||
    text === undefined
  ) {
    return text ?? "";
  }

  // Sort desc by length so that React Native will be highlighted if e.g. React and React Native are selected
  const sorted = highlights.sort((r1, r2) =>
    r1.name.length < r2.name.length ? 1 : -1
  );
  const patterns = sorted.map((p) => p.pattern.source).join("|");
  const parts = text.split(RegExp(`(${patterns})`, "gim"));

  console.debug(patterns);
  console.debug(parts);

  // Not very efficient but good enough for now
  const highlightedText = parts
    .map((textWord) =>
      filterByRegexAny(
        textWord,
        sorted.map((f) => f.pattern)
      )
        ? `<mark className="search-terms-highlight">${textWord}</mark>`
        : textWord
    )
    .join("");

  return highlightedText;
};

interface ItemListProps {
  items: Item[];
  tagFilters: TagFilter[];
  searchFilter: string | undefined;
}
const ItemList = ({ items, tagFilters, searchFilter }: ItemListProps) => (
  <List
    loading={!Array.isArray(items) || items.length == 0}
    className="job-list"
    itemLayout="horizontal"
    dataSource={items ?? []}
    renderItem={(item) => {
      const highlightedText = getHighlightedText(
        sanitizeHtml(item.text ?? ""),
        searchFilter !== undefined
          ? [
            ...tagFilters,
            TagFilter({ name: "_Search_", pattern: RegExp(searchFilter) }),
          ]
          : tagFilters
      );
      return (
        <List.Item key={item.id} className="job-list-item">
          <div>
            <div>
              {item.by} at {new Date(1000 * item.time).toLocaleString()}
            </div>
            <div dangerouslySetInnerHTML={{ __html: highlightedText }} />
          </div>
        </List.Item>
      );
    }}
  />
);

interface FilterableJobListProps {
  items: Item[];
  parentItemId: number | undefined;
  userId: string | undefined;
  filterTags: Map<string, TagFilters>;
}
const FilterableJobList = ({
  items,
  parentItemId,
  userId,
  filterTags,
}: FilterableJobListProps) => {
  const [allTagFilters, setAllTagFilters] =
    useState<Map<string, TagFilters>>(filterTags);
  const [activeTagFilters, setActiveTagFilters] = useState<
    Map<string, TagFilters>
  >(new Map());
  const [searchFilter, setSearchFilter] = useState<string | undefined>(
    undefined
  );

  const updateFilters = (
    key: string,
    tag: TagFilter,
    allFilters: Map<string, TagFilters>,
    update: (filters: TagFilters, tag: TagFilter) => TagFilters,
    stateUpdate: (filters: Map<string, TagFilters>) => void
  ): void => {
    const oldFilters: TagFilters = allFilters.get(key) ?? HashSet.empty();
    const newFilters: TagFilters = update(oldFilters, tag);
    allFilters.set(key, newFilters);
    stateUpdate(new Map([...allFilters]));
  };

  const addFilters = (
    key: string,
    tag: TagFilter,
    allFilters: Map<string, TagFilters>,
    stateUpdate: (filters: Map<string, TagFilters>) => void
  ) => {
    updateFilters(
      key,
      tag,
      allFilters,
      (filters: TagFilters, tag: TagFilter) =>
        HashSet.fromIterable([...filters, tag]),
      stateUpdate
    );
  };
  const removeFilters = (
    key: string,
    tag: TagFilter,
    allFilters: Map<string, TagFilters>,
    stateUpdate: (filters: Map<string, TagFilters>) => void
  ) => {
    updateFilters(
      key,
      tag,
      allFilters,
      (filters: TagFilters, tag: TagFilter) =>
        HashSet.filter(filters, (item) => item !== tag),
      stateUpdate
    );
  };

  const filterDiff = (
    allFilters: Map<string, TagFilters>,
    activeFilters: Map<string, TagFilters>
  ): Map<string, TagFilters> => {
    const diffMap = new Map<string, TagFilters>();
    allFilters.forEach((filters, key) =>
      diffMap.set(
        key,
        HashSet.intersection(filters, activeFilters.get(key) ?? HashSet.empty())
      )
    );
    return diffMap;
  };

  console.debug("ItemList: ", items);
  const filteredItems = itemFilter(
    items ?? [],
    flatFilters(activeTagFilters),
    searchFilter,
    parentItemId,
    userId
  );

  console.debug("FilteredItemList: ", filteredItems);

  return (
    <>
      <TagFilterBar
        allTags={allTagFilters}
        activeTags={filterDiff(allTagFilters, activeTagFilters)}
        onActive={(key: string, tag: TagFilter) =>
          addFilters(key, tag, activeTagFilters, setActiveTagFilters)
        }
        onInactive={(key: string, tag: TagFilter) =>
          removeFilters(key, tag, activeTagFilters, setActiveTagFilters)
        }
        onTagAdd={(key: string, tag: TagFilter) => {
          addFilters(key, tag, allTagFilters, setAllTagFilters)
          //TODO: put name at central place
          localStorage.setItem(
            "CustomFilters",
            JSON.stringify(Array.from(allTagFilters.get("Custom") ?? []).map(f => tagFilterToString(f)))
          )
        }
        }
        onSearch={(needle: string | undefined) => setSearchFilter(needle)}
      />
      <ItemList
        items={filteredItems}
        tagFilters={flatFilters(activeTagFilters)}
        searchFilter={searchFilter}
      />
    </>
  );
};

export { FilterableJobList };
