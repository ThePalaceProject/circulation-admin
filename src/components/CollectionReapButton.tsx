import * as React from "react";
import { CollectionData, ProtocolData } from "../interfaces";
import { protocolSupports, useCollectionTask } from "./collectionTask";
import CollectionTaskPanel from "./CollectionTaskPanel";

const REAP_LABEL_TEXT = "Queue Reap";

export interface CollectionReapButtonProps {
  collection: CollectionData;
  protocols: ProtocolData[];
  reapCollection: (collectionId: string | number) => Promise<void>;
  disabled?: boolean;
}

/**
 * Renders a reap button for collections whose protocol supports reaping.
 * Renders nothing otherwise. Reaping re-reads the collection's feed and
 * removes any titles that are no longer present in it from the catalog.
 */
const CollectionReapButton: React.FC<CollectionReapButtonProps> = ({
  collection,
  protocols,
  reapCollection,
  disabled,
}) => {
  const { busy, feedback, success, run } = useCollectionTask(collection?.id);

  if (!protocolSupports(collection, protocols, "supports_reap")) {
    return null;
  }

  const handleReap = (): Promise<void> =>
    run(
      () => reapCollection(collection.id),
      "Reap task queued. Titles that are no longer in the collection's feed will be removed from the catalog once processing completes.",
      "Failed to queue reap task."
    );

  return (
    <CollectionTaskPanel
      id="collection-reap"
      headerText="Reap"
      collectionId={collection?.id}
      feedback={feedback}
      success={success}
      controls={
        <button
          className="btn btn-default collection-reap-button collection-task-caution"
          disabled={disabled || busy}
          onClick={handleReap}
        >
          {busy ? "Queuing..." : REAP_LABEL_TEXT}
        </button>
      }
      description={
        <>
          {REAP_LABEL_TEXT} removes titles that are no longer in the
          collection's feed from the catalog — a slow, processing-intensive
          task.
        </>
      }
      docs={
        <>
          <dt>{REAP_LABEL_TEXT}</dt>
          <dd>
            Schedules a background job that re-reads the collection's entire
            feed and marks any titles that are no longer present in it as
            unavailable, removing them from the catalog. Because it re-reads
            every title rather than just recent changes, reaping is slow and
            processing-intensive, so queue it only when you need to clear out
            titles that should no longer appear — for example, when items have
            been accidentally added to the catalog and need to be removed
            without waiting for the collection's scheduled reap.
          </dd>
        </>
      }
    />
  );
};

export default CollectionReapButton;
