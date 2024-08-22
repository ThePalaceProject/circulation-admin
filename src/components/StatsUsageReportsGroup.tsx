import React = require("react");
import { Button } from "library-simplified-reusable-components";
import StatsGroup from "./StatsGroup";
import { InventoryStatistics } from "../interfaces";
import InventoryReportRequestModal from "./InventoryReportRequestModal";
import { useState } from "react";
import { useAppContext } from "../context/appContext";

type Props = {
  heading?: string;
  description?: string;
  inventoryReportsEnabled: boolean;
  library?: string;
  usageDataHref?: string;
  usageDataLabel?: string;
  usageDataTarget?: string;
};

const StatsUsageReportsGroup = ({
  heading = "Usage and Reports",
  description = `
    Access historical circulation and usage data of the Palace system
    and request inventory and holds reports to be sent via email.
  `,
  usageDataHref = "https://thepalaceproject.org",
  usageDataLabel = "View Usage",
  usageDataTarget = "_self",
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
      <ul className="stat-usage-reports">
        <li>
          <StatsGroup heading={heading} description={description}>
            <>
              {inventoryReportsEnabled && library && (
                <Button
                  callback={(() => setShowReportForm(true)) as any}
                  content={
                    <>
                      Request Report &nbsp;&nbsp;
                      <i className="fa fa-regular fa-envelope" />
                    </>
                  }
                  title="Request an inventory report."
                  disabled={showReportForm}
                />
              )}
              <div className="stat-group-description">
                These reports provide up-to-date data on both inventory and
                holds for library at the time of the request.
              </div>
            </>
          </StatsGroup>
        </li>
        <li>
          <div className="stat-link">
            <a
              href={usageDataHref}
              target={usageDataTarget}
              rel="noopener noreferrer"
            >
              {usageDataLabel}
            </a>
            &nbsp;&nbsp;
            <i className="fa fa-external-link" />
          </div>
        </li>
      </ul>
    </>
  );
};

export default StatsUsageReportsGroup;
