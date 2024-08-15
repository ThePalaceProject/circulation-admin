import React = require("react");
import { Button } from "library-simplified-reusable-components";
import StatsGroup from "./StatsGroup";
import SingleStatListItem from "./SingleStatListItem";
import { InventoryStatistics } from "../interfaces";
import InventoryReportRequestModal from "./InventoryReportRequestModal";
import { inventoryKeyToLabelMap } from "./LibraryStats";
import { useState } from "react";

type Props = {
  heading?: string;
  description?: string;
  inventory: InventoryStatistics;
  inventoryReportsEnabled: boolean;
  library?: string;
};

const StatsInventoryGroup = ({
  heading = "Inventory",
  description = "Real-time item inventory.",
  inventory,
  inventoryReportsEnabled,
  library = undefined,
}: Props) => {
  const [showReportForm, setShowReportForm] = useState(false);

  return (
    <>
      {inventoryReportsEnabled && library && (
        <InventoryReportRequestModal
          show={showReportForm}
          onHide={() => setShowReportForm(false)}
          library={library}
        />
      )}
      <StatsGroup
        heading={heading}
        description={description}
        headingAdditionalContent={
          inventoryReportsEnabled &&
          library && (
            <Button
              callback={(() => setShowReportForm(true)) as any}
              content="⬇︎"
              title="Request an inventory report"
              style={{
                borderRadius: "50%",
                marginLeft: "10px",
                marginBottom: "0",
                marginTop: "-0.7rem",
              }}
              className="inline small"
              disabled={showReportForm}
            />
          )
        }
      >
        <ul>
          <SingleStatListItem
            label={inventoryKeyToLabelMap.titles}
            value={inventory.titles}
            tooltip="Total number of books."
          />
          <SingleStatListItem
            label={inventoryKeyToLabelMap.availableTitles}
            value={inventory.availableTitles}
            tooltip="Number of books available for lending."
          />
          <SingleStatListItem
            label={inventoryKeyToLabelMap.meteredLicenseTitles}
            value={inventory.meteredLicenseTitles}
            tooltip="Number of books with a metered (counted) license."
          />
          <SingleStatListItem
            label={inventoryKeyToLabelMap.unlimitedLicenseTitles}
            value={inventory.unlimitedLicenseTitles}
            tooltip="Number of books for which there is no limit on the number of loans."
          />
          <SingleStatListItem
            label={inventoryKeyToLabelMap.openAccessTitles}
            value={inventory.openAccessTitles}
            tooltip="Number of books for which there are no limits on use."
          />
        </ul>
      </StatsGroup>
    </>
  );
};

export default StatsInventoryGroup;
