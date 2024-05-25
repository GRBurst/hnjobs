import { HashSet as HSet } from "effect";
import type { HashSet } from "effect/HashSet";

import { lazy, useEffect, useState } from "react";

import { getDatabase } from "firebase/database";
import {
  DatabaseProvider,
  useFirebaseApp,
} from "reactfire";

import { App, ConfigProvider, theme } from "antd";

import { GithubIcon } from "./Icons";
import { TagFilter, tagFilterFromString } from "../models/TagFilter";

import { locations, technologies, misc } from "../utils/predefined";
import { AppConfig } from "../utils/config";

const FilterableLocalList = lazy(() => import("./FilterableLocalList"));
const FilterableSqliteList = lazy(() => import("./FilterableSqliteList"));
const WhoIsHiring = lazy(() => import("./WhoIsHiring"));

const HnJobs = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { defaultAlgorithm, darkAlgorithm } = theme;

  const app = useFirebaseApp();
  const database = getDatabase(app);

  const predefinedFilterTags = new Map<string, HashSet<TagFilter>>();
  predefinedFilterTags.set("Technologies", technologies);
  predefinedFilterTags.set("Locations", locations);
  predefinedFilterTags.set("Misc", misc);

  const getList = (source: string): JSX.Element => {
    if (source == "local") {
      console.debug("Getting jobs from static json file.")
      return <FilterableLocalList filterTags={predefinedFilterTags} />;
    } else if (source == "sqlite") {
      console.debug("Getting jobs from static sqlite db.")
      return <FilterableSqliteList filterTags={predefinedFilterTags} />;
    } else {
      console.debug("Getting jobs live from hackernews.")
      return <WhoIsHiring filterTags={predefinedFilterTags} />;
    }
  };

  useEffect(() => {
    // Set mode to value during mount
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
    setIsDarkMode(prefersDarkMode);
    console.info("Setting color mode to: ", prefersDarkMode ? "dark" : "light");

    // Add event listener to switch if theme is changed afterwards
    window.matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', event => {
        const colorScheme = event.matches ? "dark" : "light";
        console.info("Changing color mode to: ", colorScheme);
        setIsDarkMode(true);
      });

    // Add custom filters from local storage
    const customFilters = localStorage.getItem(AppConfig.tagFilters.custom.localStorageKey)
    if (customFilters) {
      const restoredFilters = JSON.parse(customFilters).map((f: string) => tagFilterFromString(f))
      console.log("Restoring custom filters: ", restoredFilters)
      predefinedFilterTags.set(AppConfig.tagFilters.custom.sectionName, HSet.fromIterable(restoredFilters));
    }

  }, []);

  return (
    <>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: AppConfig.colors.primary,
          },
          algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm,
        }}>
        <App>
          <h1 className="hntitle">HackerNews Jobs 🚀</h1>
          <DatabaseProvider sdk={database}>
            {getList(import.meta.env.VITE_DATA_SOURCE)}
          </DatabaseProvider>
          <GithubIcon url="https://grburst.github.io/hnjobs" darkMode={isDarkMode} />
        </App>
      </ConfigProvider>
    </>
  );
}

export default HnJobs;
