import * as React from "react";
import { Panel } from "library-simplified-reusable-components";
import { CollectionData, ProtocolData } from "../interfaces";

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
  const [reaping, setReaping] = React.useState(false);
  const [feedback, setFeedback] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  React.useEffect(() => {
    setReaping(false);
    setFeedback(null);
    setSuccess(false);
  }, [collection?.id]);

  const handleReap = async (): Promise<void> => {
    setReaping(true);
    setFeedback(null);
    try {
      await reapCollection(collection.id);
      setReaping(false);
      setFeedback(
        "Reap task queued. Titles that are no longer in the collection's feed will be removed from the catalog once processing completes."
      );
      setSuccess(true);
    } catch (e) {
      const message =
        e && typeof e === "object" && "response" in e
          ? String((e as { response: string }).response)
          : "Failed to queue reap task.";
      setReaping(false);
      setFeedback(message);
      setSuccess(false);
    }
  };

  if (!supportsReap(collection, protocols)) {
    return null;
  }

  const feedbackClass = success ? "alert alert-success" : "alert alert-danger";

  const panelContent = (
    <div className="collection-reap">
      <div className="collection-reap-controls">
        <button
          className="btn btn-default collection-reap-button"
          disabled={disabled || reaping}
          onClick={handleReap}
        >
          {reaping ? "Queuing..." : REAP_LABEL_TEXT}
        </button>
      </div>
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

function supportsReap(
  collection: CollectionData,
  protocols: ProtocolData[]
): boolean {
  if (!collection?.id || !collection?.protocol) {
    return false;
  }
  const protocol = protocols.find((p) => p.name === collection.protocol);
  return !!protocol?.supports_reap;
}

export default CollectionReapButton;
