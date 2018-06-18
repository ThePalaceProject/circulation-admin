import * as React from "react";
import { Store } from "redux";
import EntryPointsTabContainer from "./EntryPointsTabContainer";
import { BookDetailsContainerProps } from "opds-web-client/lib/components/Root";
import { Navigate } from "../interfaces";
import { State } from "../reducers/index";

export interface EntryPointsTabContainerContext {
  tab: string;
  editorStore: Store<State>;
  library: (collectionUrl: string, bookUrl: string) => string;
}

export interface EntryPointsContainerProps extends BookDetailsContainerProps {
  links: any[];
  bookPage: boolean;
}

/** Wrapper for `EntryPointsTabsContainer`. This component is passed into the
    OPDSCatalog from opds-web-client. */
export default class EntryPointsContainer extends React.Component<EntryPointsContainerProps, void> {
  context: EntryPointsTabContainerContext;

  static contextTypes = {
    tab: React.PropTypes.string,
    editorStore: React.PropTypes.object.isRequired,
    library: React.PropTypes.func.isRequired
  };

  render(): JSX.Element {
    const mapEntryPointsToLabels = {
      "http://schema.org/EBook": "eBooks",
      "http://bib.schema.org/Audiobook": "Audio Books",
    };

    const { collectionUrl, bookPage } = this.props;

    let selectedTab = "All";
    let selectedEP = collectionUrl ? collectionUrl.split("?") : [];
    let selectedEP2 = selectedEP[1] ? selectedEP[1].split("=")[1] : "";
    const homeLink = this.props.links[0] ? this.props.links[0].url : "";

    // The tabs should only display on the homepage
    if (this.props.links.length > 2 || bookPage) {
      return null;
    }

    return (
      <div className="entry-points-tab-container">
        <EntryPointsTabContainer
          bookUrl={this.props.bookUrl}
          collectionUrl={this.props.collectionUrl}
          library={this.context.library}
          store={this.context.editorStore}
          activeValue={selectedEP2}
          homeLink={homeLink}>
        </EntryPointsTabContainer>
      </div>
    );
  }
}
