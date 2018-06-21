import * as React from "react";
import { Store } from "redux";
import EntryPointsTabContainer from "./EntryPointsTabContainer";
import { CollectionHeaderProps } from "opds-web-client/lib/components/Root";
import { State } from "../reducers/index";

export interface EntryPointsTabContainerContext {
  editorStore: Store<State>;
  library: (collectionUrl: string, bookUrl: string) => string;
}

/** Wrapper for `EntryPointsTabsContainer`. This component is passed into the
    OPDSCatalog from opds-web-client. */
export default class EntryPointsContainer extends React.Component<CollectionHeaderProps, void> {
  context: EntryPointsTabContainerContext;

  static contextTypes = {
    editorStore: React.PropTypes.object.isRequired,
    library: React.PropTypes.func.isRequired
  };

  render(): JSX.Element {
    const mapEntryPointsToLabels = {
      "http://schema.org/EBook": "eBooks",
      "http://bib.schema.org/Audiobook": "Audio Books",
    };

    const { collectionUrl } = this.props;
    const entryPointQuery = collectionUrl ? collectionUrl.split("?") : [];
    // Making Book the default value
    const entrypointValue =
      entryPointQuery[1] ? entryPointQuery[1].split("=")[1] : "Book";
    const homeLink = this.props.links[0] ? this.props.links[0].url : "";

    // The tabs should only display on the homepage
    if (this.props.links.length > 2) {
      return null;
    }

    return (
      <div className="entry-points-tab-container">
        <EntryPointsTabContainer
          collectionUrl={this.props.collectionUrl}
          library={this.context.library}
          store={this.context.editorStore}
          activeValue={entrypointValue}
          homeLink={homeLink}
        />
      </div>
    );
  }
}
