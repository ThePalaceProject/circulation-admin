import React = require("react");
import StatsGroup from "./StatsGroup";
import SingleStatListItem from "./SingleStatListItem";
import { CollectionInventory } from "../interfaces";
import StatsCollectionsBarChart from "./StatsCollectionsBarChart";
import StatsCollectionsList from "./StatsCollectionsList";

type Props = {
  heading?: string;
  description?: string;
  collections: CollectionInventory[];
  showBarChart: boolean;
};

const StatsCollectionsGroup = ({
  heading = "Collections",
  description = "Collections configured for your library(ies) in the Palace System.",
  collections,
  showBarChart,
}: Props) => {
  const content =
    collections.length === 0 ? (
      <span className="no-content">No associated collections.</span>
    ) : showBarChart ? (
      <StatsCollectionsBarChart collections={collections} />
    ) : (
      <StatsCollectionsList collections={collections} />
    );
  return (
    <StatsGroup heading={heading} description={description}>
      {content}
    </StatsGroup>
  );
};

export default StatsCollectionsGroup;
