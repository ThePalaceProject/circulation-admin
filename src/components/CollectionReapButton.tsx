import * as React from "react";
import { Panel } from "library-simplified-reusable-components";
import { CollectionData, ProtocolData } from "../interfaces";
import { protocolSupports, useCollectionTask } from "./collectionTask";

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

  const feedbackClass = success ? "alert alert-success" : "alert alert-danger";

  const panelContent = (
    <div className="collection-reap">
      <button
        className="btn btn-default collection-reap-button"
        disabled={disabled || busy}
        onClick={handleReap}
      >
        {busy ? "Queuing..." : REAP_LABEL_TEXT}
      </button>
      {feedback && <div className={feedbackClass}>{feedback}</div>}
      <p className="description">
        {REAP_LABEL_TEXT} removes titles that are no longer in the collection's
        feed from the catalog.
      </p>
      <details className="collection-reap-details" key={collection?.id}>
        <summary>More details</summary>
        <dl className="collection-reap-docs">
          <dt>{REAP_LABEL_TEXT}</dt>
          <dd>
            Schedules a background job that re-reads the collection's feed and
            marks any titles that are no longer present in it as unavailable,
            removing them from the catalog. Use this when items have been
            accidentally added to the catalog and need to be removed without
            waiting for the collection's scheduled reap.
          </dd>
        </dl>
      </details>
    </div>
  );

  return (
    <Panel id="collection-reap" headerText="Reap" content={panelContent} />
  );
};

export default CollectionReapButton;
