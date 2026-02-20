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

interface CollectionImportButtonState {
  force: boolean;
  importing: boolean;
  feedback: string | null;
  success: boolean;
}

/**
 * Renders an import button and "force" checkbox for collections
 * whose protocol supports import. Renders nothing otherwise.
 */
export default class CollectionImportButton extends React.Component<
  CollectionImportButtonProps,
  CollectionImportButtonState
> {
  constructor(props: CollectionImportButtonProps) {
    super(props);
    this.state = {
      force: false,
      importing: false,
      feedback: null,
      success: false,
    };
    this.handleImport = this.handleImport.bind(this);
    this.handleForceChange = this.handleForceChange.bind(this);
  }

  componentDidUpdate(prevProps: CollectionImportButtonProps): void {
    if (prevProps.collection?.id !== this.props.collection?.id) {
      this.setState({
        force: false,
        importing: false,
        feedback: null,
        success: false,
      });
    }
  }

  supportsImport(): boolean {
    const { collection, protocols } = this.props;
    if (!collection?.id || !collection?.protocol) {
      return false;
    }
    const protocol = protocols.find((p) => p.name === collection.protocol);
    return !!protocol?.supports_import;
  }

  async handleImport(): Promise<void> {
    const { collection, importCollection } = this.props;
    this.setState({ importing: true, feedback: null });
    try {
      await importCollection(collection.id, this.state.force);
      this.setState({
        importing: false,
        feedback: "Import task queued.",
        success: true,
      });
    } catch (e) {
      const message =
        e && typeof e === "object" && "response" in e
          ? String((e as { response: string }).response)
          : "Failed to queue import task.";
      this.setState({ importing: false, feedback: message, success: false });
    }
  }

  handleForceChange(e: React.ChangeEvent<HTMLInputElement>): void {
    this.setState({ force: e.target.checked });
  }

  render(): JSX.Element | null {
    if (!this.supportsImport()) {
      return null;
    }

    const { disabled } = this.props;
    const { force, importing, feedback, success } = this.state;
    const feedbackClass = success
      ? "alert alert-success"
      : "alert alert-danger";

    const panelContent = (
      <div className="collection-import">
        {feedback && <div className={feedbackClass}>{feedback}</div>}
        <div style={{ display: "flex", alignItems: "center", gap: "1em" }}>
          <button
            className="btn btn-default"
            disabled={disabled || importing}
            onClick={this.handleImport}
          >
            {importing ? "Queuing..." : "Queue Import"}
          </button>
          <label style={{ margin: 0 }}>
            <input
              type="checkbox"
              checked={force}
              onChange={this.handleForceChange}
              disabled={disabled || importing}
            />{" "}
            Force full re-import
          </label>
        </div>
      </div>
    );

    return (
      <Panel
        id="collection-import"
        headerText="Import"
        content={panelContent}
      />
    );
  }
}
