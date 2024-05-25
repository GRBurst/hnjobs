import { HashSet } from "effect";
import { useState } from "react";
import { List } from "antd";
import sanitizeHtml from "sanitize-html";

import { Item } from "../models/Item";
import { TagFilter, TagFilters, tagFilterToString } from "../models/TagFilter";
import { filterByRegexAny, flatFilters, itemFilter } from "../utils/hn";
import { TagFilterDrawer } from "./TagFilterBar";
import { AppConfig } from "../utils/config";

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
  const parts = text.split(RegExp(patterns, "gim"));

  console.debug(patterns);
  console.debug(parts);

  // Not very efficient but good enough for now
  const highlightedText = parts
    .map((textWord) =>
      filterByRegexAny(
        textWord,
        sorted.map((f) => f.pattern)
      )
        ? `<mark class="search-terms-highlight">${textWord}</mark>`
        : textWord
    )
    .join("");

  return highlightedText;
};

interface ItemListProps {
  items: Item[] | undefined;
  tagFilters: TagFilter[];
  searchFilter: string | undefined;
}
const ItemList = ({ items, tagFilters, searchFilter }: ItemListProps) => (
  <List
    loading={items === undefined || !Array.isArray(items)}
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
  items: Item[] | undefined;
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
  const flatActive = flatFilters(activeTagFilters)

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

  const filterIntersection = (
    allFilters: Map<string, TagFilters>,
    activeFilters: Map<string, TagFilters>
  ): Map<string, TagFilters> => {
    const intersectionMap = new Map<string, TagFilters>();
    allFilters.forEach((filters, key) =>
      intersectionMap.set(
        key,
        HashSet.intersection(filters, activeFilters.get(key) ?? HashSet.empty())
      )
    );
    return intersectionMap;
  };

  console.debug("ItemList: ", items);
  const filteredItems = items !== undefined ? itemFilter(
    items,
    flatActive,
    searchFilter,
    parentItemId,
    userId
  ) : undefined;

  console.debug("FilteredItemList: ", filteredItems);

  return (
    <>
      <TagFilterDrawer
        allTags={allTagFilters}
        activeTags={filterIntersection(allTagFilters, activeTagFilters)}
        onActive={(key: string, tag: TagFilter) =>
          addFilters(key, tag, activeTagFilters, setActiveTagFilters)
        }
        onInactive={(key: string, tag: TagFilter) =>
          removeFilters(key, tag, activeTagFilters, setActiveTagFilters)
        }
        onTagAdd={(key: string, tag: TagFilter) => {
          addFilters(key, tag, allTagFilters, setAllTagFilters)
          localStorage.setItem(
            AppConfig.tagFilters.custom.localStorageKey,
            JSON.stringify(Array.from(allTagFilters.get(AppConfig.tagFilters.custom.sectionName) ?? []).map(f => tagFilterToString(f)))
          )
        }}
        onTagRemove={(key: string, tag: TagFilter) => {
          removeFilters(key, tag, allTagFilters, setAllTagFilters)
          localStorage.setItem(
            AppConfig.tagFilters.custom.localStorageKey,
            JSON.stringify(Array.from(allTagFilters.get(AppConfig.tagFilters.custom.sectionName) ?? []).map(f => tagFilterToString(f)))
          )
        }}
        onSearch={(needle: string | undefined) => setSearchFilter(needle)}
      />
      <ItemList
        items={filteredItems}
        tagFilters={flatActive}
        searchFilter={searchFilter}
      />
    </>
  );
};

export { FilterableJobList };
