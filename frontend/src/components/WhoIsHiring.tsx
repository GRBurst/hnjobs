import { Effect, Option, pipe } from "effect";
import { ref } from "firebase/database";
import { useMemo, useState } from "react";
import { useDatabase } from "reactfire";
import { HnJobCategory } from "../models/HnJobs";
import { Item } from "../models/Item";
import { TagFilters } from "../models/TagFilter";
import { enrichDetachedFlag, getThreadComments } from "../utils/hn";
import { FilterableJobList } from "./FilterableJobList";

interface WhoIsHiringProps {
  filterTags: Map<string, TagFilters>;
  jobCategory: HnJobCategory;
}
const WhoIsHiring = ({ filterTags, jobCategory }: WhoIsHiringProps) => {
  const [threadComments, setThreadComments] = useState<Item[] | undefined>(
    undefined
  );

  const dbRef = ref(useDatabase());

  useMemo(() => {
    if (jobCategory.thread) {
      console.log("Getting thread: ", jobCategory.phrase);
      Effect.runPromise(
        pipe(
          // Option.getOrElse(jobCategory.thread, Effect.fail("Couldn't find relevant thread")),
          jobCategory.thread,
          Effect.flatMap(thread => getThreadComments(dbRef, thread)),
          Effect.flatMap((comments) => enrichDetachedFlag(dbRef, comments))
        )
      ).then((comments) => setThreadComments(comments));
    }
  }, [dbRef, jobCategory.thread]);

  if (!jobCategory || !threadComments || Option.isNone(jobCategory.thread)) return <></>

  return (<FilterableJobList
    items={threadComments}
    parentItemId={Option.getOrUndefined(Option.map(jobCategory.thread, thread => thread.id))}
    userId={undefined}
    filterTags={filterTags}
  />
  );
};
export default WhoIsHiring;