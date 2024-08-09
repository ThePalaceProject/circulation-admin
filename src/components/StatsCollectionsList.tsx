import * as React from "react";
import { CollectionInventory } from "../interfaces";

type Props = {
  collections: CollectionInventory[];
};

/** Displays statistics about patrons, licenses, and collections from the server,
 for a single library or all libraries the admin has access to. */
const StatsCollectionsList = ({ collections }: Props) => {
  const sortedCollections = [...collections].sort((current, next) =>
    current.name.localeCompare(next.name)
  );

  return (
    <ul className="collection-name-list">
      {sortedCollections.map(({ id, name }) => (
        <li key={id}>{name}</li>
      ))}
    </ul>
  );
};

export default StatsCollectionsList;
