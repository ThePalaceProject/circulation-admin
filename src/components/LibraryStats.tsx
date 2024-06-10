import * as React from "react";
import { useState } from "react";
import * as numeral from "numeral";
import {
  FeatureFlags,
  InventoryStatistics,
  LibraryStatistics,
  PatronStatistics,
} from "../interfaces";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "library-simplified-reusable-components";
import InventoryReportRequestModal from "./InventoryReportRequestModal";
import SingleStatListItem from "./SingleStatListItem";
import * as PropTypes from "prop-types";
import Admin from "../models/Admin";

export interface LibraryStatsProps {
  stats: LibraryStatistics;
  library?: string;
}

type OneLevelStatistics = { [key: string]: number };
type TwoLevelStatistics = { [key: string]: OneLevelStatistics };
type chartTooltipData = {
  dataKey: string;
  name?: string;
  value: number | string;
  color?: string;
  perMedium?: OneLevelStatistics;
};

const inventoryKeyToLabelMap = {
  titles: "Titles",
  availableTitles: "Available Titles",
  openAccessTitles: "Open Access Titles",
  licensedTitles: "Licensed Titles",
  unlimitedLicenseTitles: "Unlimited License Titles",
  meteredLicenseTitles: "Metered License Titles",
  meteredLicensesOwned: "Metered Licenses Owned",
  meteredLicensesAvailable: "Metered Licenses Available",
  selfHostedTitles: "Self-Hosted Titles",
};

/** Displays statistics about patrons, licenses, and collections from the server,
 for a single library or all libraries the admin has access to. */
// *** To use the legacy context here, we need to create a `contextProps` property on this function object:
// ***   InventoryReportRequestModal.contextTypes = { email: PropTypes.string }
// *** See: https://legacy.reactjs.org/docs/legacy-context.html#referencing-context-in-stateless-function-components
const LibraryStats = (
  props: LibraryStatsProps,
  context: { admin: Admin; featureFlags: FeatureFlags }
) => {
  const { stats, library } = props;
  const {
    name: libraryName,
    key: libraryKey,
    collections,
    inventorySummary: inventory,
    patronStatistics: patrons,
  } = stats || {};

  // A feature flag controls whether to show the inventory report form.
  const inventoryReportRequestEnabled =
    !context.featureFlags.reportsOnlyForSysadmins ||
    context.admin.isSystemAdmin();

  const chartItems = collections
    ?.map(({ name, inventory, inventoryByMedium }) => ({
      name,
      ...inventory,
      _by_medium: inventoryByMedium || {},
    }))
    .sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1));

  return (
    <div className="library-stats">
      {library ? (
        <h2>{libraryName || libraryKey} Statistics</h2>
      ) : (
        <h2>Statistics for All Libraries</h2>
      )}
      <ul className="stats">
        <li className="stat-group">{renderPatronsGroup(patrons)}</li>
        <li className="stat-group">{renderCirculationsGroup(patrons)}</li>
        <li className="stat-group">
          {renderInventoryGroup(
            inventory,
            inventoryReportRequestEnabled,
            library
          )}
        </li>
        <li className="stat-group stat-group-wide">
          {renderCollectionsGroup(chartItems)}
        </li>
      </ul>
    </div>
  );
};
// TODO: This is needed to support legacy context provider on this component (see above).
//  The overall approach should be replaced with another mechanism (e.g., `useContext` or
//  `useSelector` if we move `email` to new context provider or Redux, respectively).
LibraryStats.contextTypes = {
  admin: PropTypes.object.isRequired,
  featureFlags: PropTypes.object.isRequired,
};

const renderPatronsGroup = (patrons: PatronStatistics) => {
  return (
    <>
      <h3>
        <span className="stat-grouping-label">Patrons</span>
      </h3>
      <ul>
        <SingleStatListItem
          label="Total Patrons"
          value={patrons.total}
          tooltip="Total number of patrons."
        />
        <SingleStatListItem
          label="Patrons With Active Loans"
          value={patrons.withActiveLoan}
          tooltip="Number of patron with at least one active loan."
        />
        <SingleStatListItem
          label="Patrons With Active Loans or Holds"
          value={patrons.withActiveLoanOrHold}
          tooltip="Number of patrons with at least one active loan or at least one hold."
        />
      </ul>
    </>
  );
};
const renderCirculationsGroup = (patrons: PatronStatistics) => {
  return (
    <>
      <h3>
        <span className="stat-grouping-label">Circulation</span>
      </h3>
      <ul>
        <SingleStatListItem
          label="Active Loans"
          value={patrons.loans}
          tooltip="Total number of active loans for all patrons."
        />
        <SingleStatListItem
          label="Active Holds"
          value={patrons.holds}
          tooltip="Total number of active holds for all patrons."
        />
      </ul>
    </>
  );
};

const renderInventoryGroup = (
  inventory: InventoryStatistics,
  inventoryReportsEnabled: boolean,
  library?: string
) => {
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
      <h3>
        <span className="stat-grouping-label">Inventory</span>
        {inventoryReportsEnabled && library && (
          <Button
            callback={(() => setShowReportForm(true)) as any}
            content="⬇︎"
            title="Request an inventory report"
            style={{ borderRadius: "50%", marginLeft: "10px" }}
            className="inline small"
            disabled={showReportForm}
          />
        )}
      </h3>
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
    </>
  );
};

const renderCollectionsGroup = (chartItems) => {
  return chartItems.length === 0 ? (
    <h3>No associated collections.</h3>
  ) : (
    <>
      <h3>
        <span className="stat-grouping-label">Collections</span>
      </h3>
      <ResponsiveContainer height={chartItems.length * 100 + 75} width="100%">
        <BarChart
          data={chartItems}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 0, bottom: 50 }}
        >
          <YAxis
            type="category"
            dataKey="name"
            interval={0}
            angle={-45}
            tick={{ dx: -20 }}
            padding={{ top: 0, bottom: 0 }}
            height={175}
            width={125}
          />
          <XAxis type="number" />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            stackId="collections"
            name={inventoryKeyToLabelMap.meteredLicenseTitles}
            dataKey={"meteredLicenseTitles"}
            barSize={50}
            fill="#606060"
          />
          <Bar
            stackId="collections"
            name={inventoryKeyToLabelMap.unlimitedLicenseTitles}
            dataKey={"unlimitedLicenseTitles"}
            barSize={50}
            fill="#404040"
          />
          <Bar
            stackId="collections"
            name={inventoryKeyToLabelMap.openAccessTitles}
            dataKey={"openAccessTitles"}
            barSize={50}
            fill="#202020"
          />
        </BarChart>
      </ResponsiveContainer>
    </>
  );
};

/* Customize the Rechart tooltip to provide additional information */
export const CustomTooltip = ({
  active,
  payload,
  label: collectionName,
}: TooltipProps) => {
  if (!active) {
    return null;
  }

  // Nab inventory data from one of the chart payload objects.
  // This corresponds to the Barcode `data` element for the current collection.
  const chartItem = payload[0].payload;

  const propertyCountsByMedium = chartItem._by_medium || {};
  const mediumCountsByProperty: TwoLevelStatistics = Object.entries(
    propertyCountsByMedium
  ).reduce((acc, [key, value]) => {
    Object.entries(value).forEach(([innerKey, innerValue]) => {
      acc[innerKey] = acc[innerKey] || {};
      acc[innerKey][key] = innerValue;
    });
    return acc;
  }, {});
  const aboveTheLineColor = "#030303";
  const belowTheLineColor = "#A0A0A0";
  const aboveTheLine: chartTooltipData[] = [
    {
      dataKey: "titles",
      name: inventoryKeyToLabelMap.titles,
      value: chartItem.titles,
      perMedium: mediumCountsByProperty["titles"],
    },
    {
      dataKey: "availableTitles",
      name: inventoryKeyToLabelMap.availableTitles,
      value: chartItem.availableTitles,
      perMedium: mediumCountsByProperty["availableTitles"],
    },
    ...payload.filter(({ value }) => value > 0),
  ].map(({ dataKey, name, value }) => {
    const key = dataKey.toString();
    const perMedium = mediumCountsByProperty[key];
    return { dataKey: key, name, value, color: aboveTheLineColor, perMedium };
  });
  const aboveTheLineKeys = [
    "name",
    ...aboveTheLine.map(({ dataKey }) => dataKey),
  ];
  const belowTheLine = Object.entries(chartItem)
    .filter(([key]) => !aboveTheLineKeys.includes(key))
    .filter(([key]) => !key.startsWith("_"))
    .map(([dataKey, value]) => {
      const key = dataKey.toString();
      const perMedium = mediumCountsByProperty[key];
      return {
        dataKey: key,
        name: inventoryKeyToLabelMap[key],
        value:
          typeof value === "number"
            ? value
            : typeof value === "string"
            ? value
            : "",
        color: belowTheLineColor,
        perMedium,
      };
    });

  // Render our custom tooltip.
  return (
    <div className="customTooltip">
      <div className="customTooltipDetail">
        <h1 className="customTooltipHeading">{collectionName}</h1>
        {renderChartTooltipPayload(aboveTheLine)}
        <hr style={{ margin: "0.5em 0.5em" }} />
        {renderChartTooltipPayload(belowTheLine)}
      </div>
    </div>
  );
};

const renderChartTooltipPayload = (payload: Partial<chartTooltipData>[]) => {
  return payload.map(
    ({ dataKey = "", name = "", value = "", color, perMedium = {} }) => (
      <p key={dataKey} style={{ color }} className="customTooltipItem">
        {!!name && <span>{name}:</span>}
        <span> {formatNumber(value)}</span>
        {perMediumBreakdown(perMedium)}
      </p>
    )
  );
};

const perMediumBreakdown = (perMedium: OneLevelStatistics) => {
  const perMediumLabels = Object.entries(perMedium)
    .filter(([, count]) => count > 0)
    .map(([medium, count]) => `${medium}: ${formatNumber(count)}`);
  return (
    !!perMediumLabels.length && (
      <span className="customTooltipMediumBreakdown">
        {` (${perMediumLabels.join(", ")})`}
      </span>
    )
  );
};

export const formatNumber = (n: number | string | null): string => {
  // Format numbers using US conventions.
  // Else return non-numeric strings as-is.
  // Otherwise, return an empty string.
  return !isNaN(Number(n))
    ? Intl.NumberFormat("en-US").format(Number(n))
    : n === String(n)
    ? n
    : "";
};

export const humanNumber = (n: number): string =>
  n ? numeral(n).format("0.[0]a") : "0";

export default LibraryStats;
