import * as React from "react";
import { Panel } from "library-simplified-reusable-components";

export interface CollectionTaskPanelProps {
  /** DOM id for the underlying Panel. */
  id: string;
  /** Collapsible panel header text. */
  headerText: string;
  /**
   * The edited collection's id. Used as the `<details>` key so the
   * "More details" disclosure collapses when the collection changes.
   */
  collectionId?: string | number;
  /** The success or error message to display, or null when idle. */
  feedback: string | null;
  /** True when `feedback` describes a success rather than a failure. */
  success: boolean;
  /** The action button(s) and any related controls. */
  controls: React.ReactNode;
  /** Short inline description shown under the controls. */
  description: React.ReactNode;
  /** Long-form documentation revealed under "More details". */
  docs: React.ReactNode;
}

/**
 * Shared panel layout for collection task buttons (import, reap, ...).
 * Renders the supplied controls, feedback, a short description, and a
 * collapsible "More details" docs section inside a Panel.
 */
const CollectionTaskPanel: React.FC<CollectionTaskPanelProps> = ({
  id,
  headerText,
  collectionId,
  feedback,
  success,
  controls,
  description,
  docs,
}) => {
  const feedbackClass = success ? "alert alert-success" : "alert alert-danger";

  const content = (
    <div className="collection-task">
      {controls}
      {/* Keep both live regions mounted at all times, each at a fixed
          politeness, and toggle only their inner content. Several screen
          readers won't announce a region inserted into the DOM alongside its
          text, nor a politeness change on an already-mounted node — so success
          feedback routes to the permanently-polite region and errors to the
          permanently-assertive one. */}
      <div className="collection-task-feedback">
        <div aria-live="polite">
          {feedback && success && (
            <div className={feedbackClass}>{feedback}</div>
          )}
        </div>
        <div aria-live="assertive">
          {feedback && !success && (
            <div className={feedbackClass}>{feedback}</div>
          )}
        </div>
      </div>
      <p className="description">{description}</p>
      <details className="collection-task-details" key={collectionId}>
        <summary>More details</summary>
        <dl className="collection-task-docs">{docs}</dl>
      </details>
    </div>
  );

  return <Panel id={id} headerText={headerText} content={content} />;
};

export default CollectionTaskPanel;
