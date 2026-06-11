import * as React from "react";
import { CollectionData, ProtocolData } from "../interfaces";
import { protocolSupports, useCollectionTask } from "./collectionTask";
import CollectionTaskPanel from "./CollectionTaskPanel";

const IMPORT_DEFAULT_LABEL_TEXT = "Queue Import";
const IMPORT_FORCED_FULL_LABEL_TEXT = "Force full re-import";

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
  const { busy, feedback, success, run } = useCollectionTask(collection?.id);

  React.useEffect(() => {
    setForce(false);
  }, [collection?.id]);

  const handleImport = (): Promise<void> =>
    run(
      () => importCollection(collection.id, force),
      force
        ? "Full re-import task queued. All items will be re-processed — this may take longer than a regular import. Changes will appear in the catalog once processing completes."
        : "Import task queued. New and updated items will appear in the catalog once processing completes.",
      "Failed to queue import task."
    );

  if (!protocolSupports(collection, protocols, "supports_import")) {
    return null;
  }

  const buttonLabel = getButtonLabel(force, busy);

  const buttonClass = force
    ? "btn btn-default collection-import-button force collection-task-caution"
    : "btn btn-default collection-import-button";

  return (
    <CollectionTaskPanel
      id="collection-import"
      headerText="Import"
      collectionId={collection?.id}
      feedback={feedback}
      success={success}
      controls={
        <div className="collection-import-controls">
          <button
            className={buttonClass}
            disabled={disabled || busy}
            onClick={handleImport}
          >
            {buttonLabel}
          </button>
          <label>
            <input
              type="checkbox"
              checked={force}
              onChange={(e) => setForce(e.target.checked)}
              disabled={disabled || busy}
            />{" "}
            {IMPORT_FORCED_FULL_LABEL_TEXT}
          </label>
        </div>
      }
      description={
        <>
          {IMPORT_DEFAULT_LABEL_TEXT} picks up new and changed items. Check{" "}
          <strong>{IMPORT_FORCED_FULL_LABEL_TEXT}</strong> to re-process
          everything.
        </>
      }
      docs={
        <>
          <dt>{IMPORT_DEFAULT_LABEL_TEXT}</dt>
          <dd>
            Schedules a background import job that checks for new or updated
            items from the collection source and adds them to the catalog. Only
            items that have changed since the last import are processed. Use
            this when new titles have been added to a collection but do not yet
            appear in the catalog, or when you want to pick up recent changes
            from the source.
          </dd>
          <dt>{IMPORT_FORCED_FULL_LABEL_TEXT}</dt>
          <dd>
            When checked, the import job re-processes every item in the
            collection, regardless of whether it appears to have changed since
            the last import. Use this to correct metadata that is out of date,
            or to resolve issues caused by a previously incomplete import. A
            forced re-import will take longer than a regular import because it
            re-processes all items.
          </dd>
        </>
      }
    />
  );
};

function getButtonLabel(force: boolean, importing: boolean): string {
  if (force) {
    return importing ? "Queuing Full Re-import..." : "Queue Full Re-import";
  }
  return importing ? "Queuing..." : "Queue Import";
}

export default CollectionImportButton;
