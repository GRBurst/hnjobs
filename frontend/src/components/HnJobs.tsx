import { HashSet as HSet } from "effect";
import type { HashSet } from "effect/HashSet";

import { lazy, useEffect, useState } from "react";

import { App, ConfigProvider, Layout, Menu, theme } from "antd";

import { TagFilter, tagFilterFromString } from "../models/TagFilter";
import { GithubIcon } from "./Icons";

import { UserOutlined, VideoCameraOutlined } from "@ant-design/icons";
import { AppConfig } from "../utils/config";
import { locations, misc, role, technologies } from "../utils/predefined";

const FilterableLocalList = lazy(() => import("./FilterableLocalList"));
const FilterableSqliteList = lazy(() => import("./FilterableSqliteList"));
const WhoIsData = lazy(() => import("./WhoIsLiveDataList"));

const { Header, Sider, Content } = Layout;

const HnJobs = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { defaultAlgorithm, darkAlgorithm } = theme;

  const predefinedFilterTags = new Map<string, HashSet<TagFilter>>();
  predefinedFilterTags.set("Technologies", technologies);
  predefinedFilterTags.set("Locations", locations);
  predefinedFilterTags.set("Role", role);
  predefinedFilterTags.set("Misc", misc);

  const getList = (source: string): JSX.Element => {
    if (source == "local") {
      console.debug("Getting jobs from static json file.");
      return <FilterableLocalList filterTags={predefinedFilterTags} />;
    } else if (source == "sqlite") {
      console.debug("Getting jobs from static sqlite db.");
      return <FilterableSqliteList filterTags={predefinedFilterTags} />;
    } else {
      console.debug("Getting jobs live from hackernews.");
      return <WhoIsData filterTags={predefinedFilterTags} />;
    }
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
                items={[
                  {
                    key: "1",
                    icon: <UserOutlined />,

                    label: "nav 1",
                  },
                  {
                    key: "2",
                    icon: <VideoCameraOutlined />,
                    label: "nav 2",
                  },
                ]}
              ></Menu>
            </Sider>
            <Content>
              {/* <WhoIsData filterTags={predefinedFilterTags} /> */}
              {getList(import.meta.env.VITE_DATA_SOURCE)}
            </Content>
          </Layout>
        </App>
      </ConfigProvider>
    </>
  );
};

export default HnJobs;
