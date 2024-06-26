import { Effect, Option, HashSet as HSet } from "effect";
import type { HashSet } from "effect/HashSet";

import { lazy, useEffect, useState } from "react";

import { App, ConfigProvider, Layout, Menu, theme } from "antd";

import { TagFilter, tagFilterFromString } from "../models/TagFilter";
import { GithubIcon } from "./Icons";

import { UserOutlined, VideoCameraOutlined } from "@ant-design/icons";
import { AppConfig } from "../utils/config";
import { locations, misc, role, technologies } from "../utils/predefined";
import { HnJobCategory, HnJobs as HnJobsData } from "../models/HnJobs";

// const FilterableLocalList = lazy(() => import("./FilterableLocalList"));
// const FilterableSqliteList = lazy(() => import("./FilterableSqliteList"));
// const WhoIsData = lazy(() => import("./WhoIsLiveData"));
import { getWhoIsData } from "./WhoIsLiveData";
import { DatabaseProvider } from "reactfire";
const WhoIsHiring = lazy(() => import("./WhoIsHiring"));

const { Header, Sider, Content } = Layout;

const HnJobs = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [hnJobMenu, setHnJobMenu] = useState<Option.Option<string>>(Option.none());
  const { defaultAlgorithm, darkAlgorithm } = theme;

  const predefinedFilterTags = new Map<string, HashSet<TagFilter>>();
  predefinedFilterTags.set("Technologies", technologies);
  predefinedFilterTags.set("Locations", locations);
  predefinedFilterTags.set("Role", role);
  predefinedFilterTags.set("Misc", misc);

  const getList = (source: string, key: Option.Option<string>): Effect.Effect<HnJobsData, Error> => {
    // if (source == "local") {
    //   console.debug("Getting jobs from static json file.");
    //   return <FilterableLocalList filterTags={predefinedFilterTags} />;
    // } else if (source == "sqlite") {
    //   console.debug("Getting jobs from static sqlite db.");
    //   return <FilterableSqliteList filterTags={predefinedFilterTags} />;
    // } else {
    //   console.debug("Getting jobs live from hackernews.");
    //   return <WhoIsData filterTags={predefinedFilterTags} menuKey={key} />;
    //   return getWhoIsData();
    // }
    return getWhoIsData();
  };

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

  const jobsE: Effect.Effect<HnJobsData, Error> = getList(import.meta.env.VITE_DATA_SOURCE, hnJobMenu)

  const foundCategories: Effect.Effect<HnJobCategory[], Error> =
    Effect.map(jobsE, jobs =>
      Object.values(jobs)
        .filter((category: Option.Option<HnJobCategory>) => Option.isSome(category))
        .map((c: Option.Some<HnJobCategory>) => c.value)
    );

  console.log("Found categories: ", foundCategories);
  if (!foundCategories) return <></>;

  const jobContent = foundCategories
    .find(category => Option.getOrElse(
      Option.map(hnJobMenu, job => job === category.id.toString()),
      () => false))

  if (!jobContent) return <></>

  const jobContentNode = <WhoIsHiring filterTags={predefinedFilterTags} jobCategory={jobContent} />

  const jobMenu = foundCategories.map((category) => ({
    key: category.id.toString(),
    label: category.phrase,
  }));


  // const jobContent = <WhoIsHiring filterTags={filterTags} jobCategory={category} />,
  // return (
  //   <DatabaseProvider sdk={db}>
  //     <FilterContext.Provider value={filterTags}>
  //       {job}
  //     </FilterContext.Provider>
  //   </DatabaseProvider>
  // );

  return (
    <>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: AppConfig.colors.primary,
          },
          algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm,
        }}
      >
        <App>
          <Layout>
            <Header>
              {/* <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: '16px',
                width: 64,
                height: 64,
              }}
            /> */}
              <h1 className="hntitle">HackerNews Jobs 🚀</h1>
              <GithubIcon
                url="https://grburst.github.io/hnjobs"
                darkMode={isDarkMode}
              />
            </Header>
          </Layout>
          <Layout>
            <Sider trigger={null} collapsible>
              <Menu
                items={jobMenu}
                // onClick={({ item, key, keyPath, domEvent }) => console.log(`Key: ${key}, Item: ${item}, path: ${keyPath}`)}
                // onClick={(foo) => console.log("Menu: ", foo)}
                onClick={(menu) => setHnJobMenu(Option.some(menu.key))}
              ></Menu>
            </Sider>
            <Content>
              {jobContentNode}
              {/* <WhoIsData filterTags={predefinedFilterTags} menuKey={hnJobMenu} /> */}
              {/* {getList(import.meta.env.VITE_DATA_SOURCE, hnJobMenu)} */}
            </Content>
          </Layout>
        </App>
      </ConfigProvider>
    </>
  );
};

export default HnJobs;
