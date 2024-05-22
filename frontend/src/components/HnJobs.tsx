import type { HashSet } from "effect/HashSet";

import { lazy } from "react";

import { getDatabase } from "firebase/database";
import {
  DatabaseProvider,
  useFirebaseApp,
} from "reactfire";


import { TagFilter } from "../models/TagFilter";

import { locations, technologies } from "../utils/predefined";

const FilterableLocalList = lazy(() => import("./FilterableLocalList"));
const FilterableSqliteList = lazy(() => import("./FilterableSqliteList"));
const WhoIsHiring = lazy(() => import("./WhoIsHiring"));

function HnJobs() {
  const app = useFirebaseApp();
  const database = getDatabase(app);

  const predefinedFilterTags = new Map<string, HashSet<TagFilter>>();
  predefinedFilterTags.set("Technologies", technologies);
  predefinedFilterTags.set("Locations", locations);

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

  return (
    <>
      <DatabaseProvider sdk={database}>
        <h1 className="hntitle">HackerNews Jobs 🚀</h1>
        {getList(import.meta.env.VITE_DATA_SOURCE)}
      </DatabaseProvider>
    </>
  );
}

export default HnJobs;
