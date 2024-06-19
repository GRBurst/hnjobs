import { HashSet as HSet } from "effect";
import type { HashSet } from "effect/HashSet";

import { lazy, useEffect, useState } from "react";

import { getDatabase } from "firebase/database";
import { DatabaseProvider, useFirebaseApp } from "reactfire";

import { App, ConfigProvider, Tabs, theme } from "antd";

import { TagFilter, tagFilterFromString } from "../models/TagFilter";
import { GithubIcon } from "./Icons";

import { AppConfig } from "../utils/config";
import { locations, misc, role, technologies } from "../utils/predefined";

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
  predefinedFilterTags.set("Role", role);
  predefinedFilterTags.set("Misc", misc);

  const listDataSource = import.meta.env.VITE_DATA_SOURCE;

  const getWhoIsHiringList = (source: string): JSX.Element => {
    if (source == "local") {
      console.debug("Getting jobs from static json file.");
      return <FilterableLocalList filterTags={predefinedFilterTags} />;
    } else if (source == "sqlite") {
      console.debug("Getting jobs from static sqlite db.");
      return <FilterableSqliteList filterTags={predefinedFilterTags} />;
    } else {
      console.debug("Getting jobs live from hackernews.");
      return (
        <DatabaseProvider sdk={database}>
          <WhoIsHiring filterTags={predefinedFilterTags} />;
        </DatabaseProvider>
      );
    }
  };

  const getWhoWantsToBeHiredList = (source: string): JSX.Element => {
    if (source == "local") {
      console.debug("Getting jobs from static json file.");
      return <></>;
    } else if (source == "sqlite") {
      console.debug("Getting jobs from static sqlite db.");
      return <></>;
    } else {
      console.debug("Getting jobs live from hackernews.");
      return (
        <DatabaseProvider sdk={database}>
          <WhoIsHiring filterTags={predefinedFilterTags} />;
        </DatabaseProvider>
      );
    }
  };

  const whoIsHiringTab = (source: string) => ({
    key: "whoishiring",
    label: "Who Is Hiring?",
    children: [{ getWhoIsHiringList(source) }],
  });
  
  const HnJobsTabs = 
    <Tabs tabPosition="left" items={[whoIsHiringTab(listDataSource)]} />

  useEffect(() => {
    // Set mode to value during mount
    const prefersDarkMode = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    setIsDarkMode(prefersDarkMode);
    console.info("Setting color mode to: ", prefersDarkMode ? "dark" : "light");

    // Add event listener to switch if theme is changed afterwards
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (event) => {
        const colorScheme = event.matches ? "dark" : "light";
        console.info("Changing color mode to: ", colorScheme);
        setIsDarkMode(true);
      });

    // Add custom filters from local storage
    const customFilters = localStorage.getItem(
      AppConfig.tagFilters.custom.localStorageKey
    );
    if (customFilters) {
      const restoredFilters = JSON.parse(customFilters).map((f: string) =>
        tagFilterFromString(f)
      );
      console.log("Restoring custom filters: ", restoredFilters);
      if (restoredFilters?.length) {
        predefinedFilterTags.set(
          AppConfig.tagFilters.custom.sectionName,
          HSet.fromIterable(restoredFilters)
        );
      }
    }
  }, []);

  return (
    <>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: AppConfig.colors.primary,
            // colorBgBase: "#f6f6ef", // #828282 ?
            // colorPrimaryBg: "#f6f6ef",
            // colorPrimaryBg: "#f6f6ef",
            // colorBgBase: "#f6f6ef", // #828282 ?
          },
          algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm,
        }}
      >
        <App>
          <h1 className="hntitle">HackerNews Jobs 🚀</h1>
          {HnJobsTabs}
          {/* <HnJobsTabs /> */}
          <GithubIcon
            url="https://grburst.github.io/hnjobs"
            darkMode={isDarkMode}
          />
        </App>
      </ConfigProvider>
    </>
  );
};

export default HnJobs;
