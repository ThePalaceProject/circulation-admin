import * as React from "react";
import { Panel } from "library-simplified-reusable-components";
import { CollectionData, ProtocolData } from "../interfaces";

export interface CollectionImportButtonProps {
  collection: CollectionData;
  protocols: ProtocolData[];
  importCollection: (
    collectionId: string | number,
    force: boolean
  ) => Promise<void>;
  disabled?: boolean;
}

/**
 * Renders an import button and "force" checkbox for collections
 * whose protocol supports import. Renders nothing otherwise.
 */
const CollectionImportButton: React.FC<CollectionImportButtonProps> = ({
  collection,
  protocols,
  importCollection,
  disabled,
}) => {
  const [force, setForce] = React.useState(false);
  const [importing, setImporting] = React.useState(false);
  const [feedback, setFeedback] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  React.useEffect(() => {
    setForce(false);
    setImporting(false);
    setFeedback(null);
    setSuccess(false);
  }, [collection?.id]);

  const supportsImport = (): boolean => {
    if (!collection?.id || !collection?.protocol) {
      return false;
    }
    const protocol = protocols.find((p) => p.name === collection.protocol);
    return !!protocol?.supports_import;
  };

  const handleImport = async (): Promise<void> => {
    setImporting(true);
    setFeedback(null);
    try {
      await importCollection(collection.id, force);
      setImporting(false);
      setFeedback(
        force
          ? "Full re-import task queued. All items will be re-processed — this may take longer than a regular import. Changes will appear in the catalog once processing completes."
          : "Import task queued. New and updated items will appear in the catalog once processing completes."
      );
      setSuccess(true);
    } catch (e) {
      const message =
        e && typeof e === "object" && "response" in e
          ? String((e as { response: string }).response)
          : "Failed to queue import task.";
      setImporting(false);
      setFeedback(message);
      setSuccess(false);
    }
  };

  if (!supportsImport()) {
    return null;
  }

  const feedbackClass = success ? "alert alert-success" : "alert alert-danger";

  const buttonLabel = getButtonLabel(force, importing);

  const buttonClass = force
    ? "btn btn-default collection-import-button force"
    : "btn btn-default collection-import-button";

  const panelContent = (
    <div className="collection-import">
      <div className="collection-import-controls">
        <button
          className={buttonClass}
          disabled={disabled || importing}
          onClick={handleImport}
        >
          {buttonLabel}
        </button>
        <label>
          <input
            type="checkbox"
            checked={force}
            onChange={(e) => setForce(e.target.checked)}
            disabled={disabled || importing}
          />{" "}
          Force full re-import
        </label>
      </div>
      {feedback && <div className={feedbackClass}>{feedback}</div>}
      <p className="description">
        Queue Import picks up new and changed items. Check{" "}
        <strong>Force full re-import</strong> to re-process everything.
      </p>
      <details className="collection-import-details" key={collection?.id}>
        <summary>More details</summary>
        <dl className="collection-import-docs">
          <dt>Queue Import</dt>
          <dd>
            Schedules a background import job that checks for new or updated
            items from the collection source and adds them to the catalog. Only
            items that have changed since the last import are processed. Use
            this when new titles have been added to a collection but do not yet
            appear in the catalog, or when you want to pick up recent changes
            from the source.
          </dd>
          <dt>Force full re-import</dt>
          <dd>
            When checked, the import job re-processes every item in the
            collection, regardless of whether it appears to have changed since
            the last import. Use this to correct metadata that is out of date,
            or to resolve issues caused by a previously incomplete import. A
            forced re-import will take longer than a regular import because it
            re-processes all items.
          </dd>
        </dl>
      </details>
    </div>
  );

  return (
    <Panel id="collection-import" headerText="Import" content={panelContent} />
  );
};

function getButtonLabel(force: boolean, importing: boolean): string {
  if (force) {
    return importing ? "Queuing Full Re-import..." : "Queue Full Re-import";
  }
  return importing ? "Queuing..." : "Queue Import";
}

export default CollectionImportButton;
