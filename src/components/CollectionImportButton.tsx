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
      setFeedback("Import task queued.");
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

  const panelContent = (
    <div className="collection-import">
      {feedback && <div className={feedbackClass}>{feedback}</div>}
      <div className="collection-import-controls">
        <button
          className="btn btn-default"
          disabled={disabled || importing}
          onClick={handleImport}
        >
          {importing ? "Queuing..." : "Queue Import"}
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
    </div>
  );

  return (
    <Panel id="collection-import" headerText="Import" content={panelContent} />
  );
};

export default CollectionImportButton;
