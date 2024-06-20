import { TagFilters } from "../models/TagFilter";

import { getDatabase } from "firebase/database";
import { lazy } from "react";
import { DatabaseProvider, useFirebaseApp } from "reactfire";

import { Tabs } from "antd";

const WhoIsHiring = lazy(() => import("./WhoIsHiring"));
const WhoWantsHired = lazy(() => import("./WhoWantsHired"));
const WhoFreelancer = lazy(() => import("./WhoFreelancer"));

export interface WhoIsDataProps {
  filterTags: Map<string, TagFilters>;
}
export const WhoIsData = ({ filterTags }: WhoIsDataProps) => {
  const app = useFirebaseApp();
  const database = getDatabase(app);

  // <DatabaseProvider sdk={database}>
  //   <WhoIsHiring filterTags={filterTags} />;
  // </DatabaseProvider>

  const whoIsHiringTab = {
    key: "whoishiring",
    label: "Who is hiring?",
    children: [<WhoIsHiring filterTags={filterTags} />],
  };
  // const whoWantsHiredTab = {
  //   key: "whowantshired",
  //   label: "Who wants to be hired?",
  //   children: [<WhoWantsHired filterTags={filterTags} />],
  // };
  // const whoFreelancerTab = {
  //   key: "whofreelancer",
  //   label: "Who wants to be hired?",
  //   children: [<WhoFreelancer filterTags={filterTags} />],
  // };

  const tabItems = [whoIsHiringTab];

  const HnJobsTabs = <Tabs tabPosition="left" items={tabItems} />;

  return (
    <DatabaseProvider sdk={database}>
      <Tabs tabPosition="left" items={tabItems} />
    </DatabaseProvider>
  );

  HnJobsTabs;
};

export default WhoIsData;
