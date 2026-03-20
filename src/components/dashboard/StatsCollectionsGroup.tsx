import React = require("react");
import StatsGroup from "./StatsGroup";
import { CollectionInventory } from "../../interfaces";
import StatsCollectionsBarChart from "./StatsCollectionsBarChart";
import StatsCollectionsList from "./StatsCollectionsList";
import StatsCollectionsTable from "./StatsCollectionsTable";

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
  const [viewMode, setViewMode] = React.useState<"chart" | "table">("chart");
  const canSwitchView = showBarChart && collections.length > 0;

  const headingAdditionalContent = canSwitchView ? (
    <span
      className="collection-view-toggle"
      role="group"
      aria-label="Collections view mode"
    >
      <button
        type="button"
        className={`collection-view-toggle-button ${
          viewMode === "chart" ? "active" : ""
        }`}
        onClick={() => setViewMode("chart")}
      >
        Chart
      </button>
      <button
        type="button"
        className={`collection-view-toggle-button ${
          viewMode === "table" ? "active" : ""
        }`}
        onClick={() => setViewMode("table")}
      >
        Table
      </button>
    </span>
  ) : null;

  const content =
    collections.length === 0 ? (
      <span className="no-content">No associated collections.</span>
    ) : showBarChart && viewMode === "chart" ? (
      <StatsCollectionsBarChart collections={collections} />
    ) : showBarChart && viewMode === "table" ? (
      <StatsCollectionsTable collections={collections} />
    ) : (
      <StatsCollectionsList collections={collections} />
    );
  return (
    <StatsGroup
      heading={heading}
      headingAdditionalContent={headingAdditionalContent}
      description={description}
    >
      {content}
    </StatsGroup>
  );
};

export default StatsCollectionsGroup;
