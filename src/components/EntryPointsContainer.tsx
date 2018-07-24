import * as React from "react";
import EntryPointsTabs from "./EntryPointsTabs";
import { CollectionContainerProps } from "opds-web-client/lib/components/Root";
import Collection from "opds-web-client/lib/components/Collection";

/** Wrapper for `EntryPointsTabs`. This component is passed into the
    OPDSCatalog from opds-web-client. */
export default class EntryPointsContainer extends React.Component<CollectionContainerProps, void> {
  render(): JSX.Element {
    const child = React.Children.only(this.props.children);
    const collectionCopy = JSON.parse(JSON.stringify(child.props.collection));
    const facetGroups = collectionCopy && collectionCopy.facetGroups ?
      collectionCopy.facetGroups : [];
    const newProps = Object.assign({}, child.props);

    let facets = [];
    if (facetGroups && facetGroups.length) {
      let remove;
      facetGroups.forEach((facetGroup, i) => {
        if (facetGroup.label === "Formats") {
          remove = i;
          facets = facetGroup.facets.slice();
        }
      });

      // We do not want to display the formats facets in the left sidebar,
      // so remove it from the facetGroups and update it in the new Collection props.
      if (remove !== undefined) {
        facetGroups.splice(remove, 1);
      }
    }

    collectionCopy.facetGroups = facetGroups;
    newProps.collection = collectionCopy;
    const collection = React.createElement(Collection, newProps);

    return (
      <div className="entry-points-tab-container">
        <EntryPointsTabs facets={facets} />
        {collection}
      </div>
    );
  }
}
