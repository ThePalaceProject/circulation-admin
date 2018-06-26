import * as React from "react";
import EntryPointsTabs from "./EntryPointsTabs";
import { CollectionHeaderProps } from "opds-web-client/lib/components/Root";

/** Wrapper for `EntryPointsTabs`. This component is passed into the
    OPDSCatalog from opds-web-client. */
export default class EntryPointsContainer extends React.Component<CollectionHeaderProps, void> {
  render(): JSX.Element {
    const { facetGroups } = this.props;

    let formats = { label: "", facets: [] };
    if (facetGroups.length) {
      facetGroups.forEach(facetGroup => {
        if (facetGroup.label === "Formats") {
          formats = facetGroup;
        }
      });
    }

    // The tabs should only display on the homepage
    if (!formats.facets.length) {
      return null;
    }

    return (
      <div className="entry-points-tab-container">
        <EntryPointsTabs formats={formats} />
      </div>
    );
  }
}
