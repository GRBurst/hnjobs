
import { Flex, FloatButton, List, Slider } from "antd";
import { CSSProperties, useState } from "react";
import sanitizeHtml from "sanitize-html";
import { DesignPaletteIcon } from "./Icons";

import { Item } from "../models/Item";
import {
  TagFilter,
  TagFilterSimple,
  TagFilters,
  tagFilterToString,
} from "../models/TagFilter";
import { AppConfig } from "../utils/config";
import {
  addFilters,
  filterByRegexAny,
  filterIntersection,
  flatFilters,
  itemFilter,
  itemPrefilter,
  removeFilters,
} from "../utils/filters";
import { JobStatistics } from "./JobStatistics";
import { TagFilterDrawer } from "./TagFilterBar";

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
const ItemList = ({ items, tagFilters, searchFilter }: ItemListProps) => {
  const [showSlider, setShowSlider] = useState<boolean>(false);
  const displayStyle: CSSProperties = {
    display: showSlider ? "block" : "none",
  };
  const sliderExpander = (
    <FloatButton
      className="design-button"
      onClick={() => setShowSlider(!showSlider)}
      tooltip={<div>Edit Design</div>}
      icon={<DesignPaletteIcon />}
      type={showSlider ? "primary" : "default"}
    />
  );
  const slider = (
    <div className="slider-width-container" style={displayStyle}>
      <h4>Page Width</h4>
      <Slider
        className="slider-width"
        defaultValue={0}
        max={45}
        onChange={(sliderValue: Number) =>
          (document.body.style.padding = `0 ${sliderValue}%`)
        }
        tooltip={{ formatter: (value) => (value ? 2 * value : 0) }}
      />
    </div>
  );

  return (
    <>
      {slider}
      {sliderExpander}
      <List
        header={
          <Flex justify="space-between">
            <h3 className="list-header">{items?.length ?? 0} Jobs</h3>
          </Flex>
        }
        loading={items === undefined || !Array.isArray(items)}
        className="job-list"
        itemLayout="horizontal"
        dataSource={items ?? []}
        renderItem={(item) => {
          const highlightedText = getHighlightedText(
            sanitizeHtml(item.text ?? ""),
            searchFilter !== undefined
              ? [...tagFilters, TagFilterSimple("_Search_", searchFilter)]
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
    </>
  );
};

interface FilterableJobListExternProps {
  items: Item[] | undefined
  parentItemId: number | undefined
  userId: string | undefined
  tagFilters: Map<string, TagFilters>
  updateTagFilters: (filters: Map<string, TagFilters>) => void
  activeTagFilters: Map<string, TagFilters>
  updateActiveTagFilters: (filters: Map<string, TagFilters>) => void
  searchFilter: string | undefined,
  updateSearchFilter: (needle: string | undefined) => void,
}
const FilterableJobListExtern = ({
  items,
  parentItemId,
  userId,
  tagFilters,
  updateTagFilters,
  activeTagFilters,
  updateActiveTagFilters,
  searchFilter,
  updateSearchFilter,
}: FilterableJobListExternProps) => {
  const flatActive = flatFilters(activeTagFilters);

  console.debug("ItemList: ", items);
  const cleansedItems =
    items !== undefined
      ? itemPrefilter(items, parentItemId, userId)
      : undefined;

  const filteredItems =
    cleansedItems !== undefined
      ? itemFilter(cleansedItems, flatActive, searchFilter)
      : undefined;

  console.debug("FilteredItemList: ", filteredItems);

  return (
    <>
      <TagFilterDrawer
        allTags={tagFilters}
        activeTags={filterIntersection(tagFilters, activeTagFilters)}
        onActive={(key: string, tag: TagFilter) =>
          addFilters(key, tag, activeTagFilters, updateActiveTagFilters)
        }
        onInactive={(key: string, tag: TagFilter) =>
          removeFilters(key, tag, activeTagFilters, updateActiveTagFilters)
        }
        onTagAdd={(key: string, tag: TagFilter) => {
          addFilters(key, tag, tagFilters, updateTagFilters);
          localStorage.setItem(
            AppConfig.tagFilters.custom.localStorageKey,
            JSON.stringify(
              Array.from(
                tagFilters.get(AppConfig.tagFilters.custom.sectionName) ?? []
              ).map((f) => tagFilterToString(f))
            )
          );
        }}
        onTagRemove={(key: string, tag: TagFilter) => {
          removeFilters(key, tag, tagFilters, updateTagFilters);
          localStorage.setItem(
            AppConfig.tagFilters.custom.localStorageKey,
            JSON.stringify(
              Array.from(
                tagFilters.get(AppConfig.tagFilters.custom.sectionName) ?? []
              ).map((f) => tagFilterToString(f))
            )
          );
        }}
        onSearch={(needle: string | undefined) => updateSearchFilter(needle)}
        visualizer={
          <JobStatistics
            allItems={cleansedItems ?? []}
            items={filteredItems ?? []}
            activeFilters={flatActive}
          />
        }
      />
      <ItemList
        items={filteredItems}
        tagFilters={flatActive}
        searchFilter={searchFilter}
      />
    </>
  );
};

export { FilterableJobListExtern };


