import React = require("react");
import StatsGroup from "./StatsGroup";
import InventoryReportRequestModal from "./InventoryReportRequestModal";
import { useState } from "react";

type Props = {
  heading?: string;
  description?: string;
  inventoryReportsEnabled: boolean;
  quicksightLinkEnabled: boolean;
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
  quicksightLinkEnabled,
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
      <StatsGroup heading={heading} description={description}>
        <div className="flex flex-col gap-6">
          {!inventoryReportsEnabled && !quicksightLinkEnabled && (
            <p className="text-sm italic text-gray-500">
              Usage reporting is not available.
            </p>
          )}

          {/* View Usage — shown first */}
          {quicksightLinkEnabled && (
            <div className="flex flex-col gap-2">
              <div>
                <a
                  href={usageDataHref}
                  target={usageDataTarget}
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 active:bg-blue-800 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
                >
                  {usageDataLabel}
                  <i className="fa fa-external-link text-xs" aria-hidden />
                </a>
              </div>
              <p className="text-sm text-gray-600">
                View historical circulation and usage data for this library.
              </p>
            </div>
          )}

          {/* Request Report — shown second */}
          {inventoryReportsEnabled && library && (
            <div className="flex flex-col gap-2">
              <div>
                <button
                  className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 active:bg-blue-800 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none"
                  onClick={() => setShowReportForm(true)}
                  disabled={showReportForm}
                  title="Request an inventory report."
                >
                  Request Report
                  <i
                    className="fa fa-regular fa-envelope text-xs"
                    aria-hidden
                  />
                </button>
              </div>
              <p className="text-sm text-gray-600">
                These reports provide up-to-date data on both inventory and
                holds for this library at the time of the request.
              </p>
            </div>
          )}
        </div>
      </StatsGroup>
    </>
  );
};

export default StatsUsageReportsGroup;
