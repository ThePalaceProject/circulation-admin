import * as React from "react";
import { LibraryStatistics } from "../interfaces";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import DefaultTooltipContent from "recharts/lib/component/DefaultTooltipContent";
import SingleStatListItem from "./SingleStatListItem";

export interface LibraryStatsProps {
  stats: LibraryStatistics;
  library?: string;
}

const inventoryKeyToLabelMap = {
  titles: "Title Count",
  lendable: "Lendable Titles",
  openAccess: "Open Access Titles",
  licensed: "Licensed Titles",
  unlimitedLicense: "Unlimited License Titles",
  meteredLicense: "Metered License Titles",
  meteredLicensesOwned: "Metered Licenses Owned",
  meteredLicensesAvailable: "Metered Licenses Available",
  selfHosted: "Self-Hosted Titles",
};

export const formatNumber = (n: number | string | null): string => {
  // Format numbers using US conventions.
  // Pass non-numeric strings as-is.
  // Other values are converted to an empty string.
  let value;
  if (!isNaN(Number(n))) {
    value = Intl.NumberFormat("en-US").format(Number(n));
  } else if (n === String(n)) {
    value = n;
  } else {
    value = "";
  }
  return value;
};

type chartTooltipData = {
  dataKey: string;
  name: string;
  value: number;
  color: string;
};

/** Displays statistics about patrons, licenses, and collections from the server,
 for a single library or all libraries the admin has access to. */
const LibraryStats = (props: LibraryStatsProps) => {
  const {
    stats: {
      name: libraryName,
      key: libraryKey,
      collections,
      inventorySummary: inventory,
      patronStatistics: patrons,
    },
    library,
  } = props;

  const chartItems =
    props.stats &&
    props.stats.collections &&
    collections
      .map(({ name, inventory }) => ({ name, ...inventory }))
      .sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1));

  /* Customize the Rechart tooltip to provide additional information */
  const CustomTooltip = (props) => {
    const { active, payload, label: collection } = props;
    if (!active) return null;

    // Nab inventory data from one of the chart payload objects.
    const chartInventory = payload[0].payload;
    const aboveTheLineColor = "#030303";
    const belowTheLineColor = "#A0A0A0";
    const aboveTheLine: chartTooltipData[] = [
      {
        dataKey: "titles",
        name: inventoryKeyToLabelMap.titles,
        value: chartInventory.titles,
      },
      {
        dataKey: "lendable",
        name: inventoryKeyToLabelMap.lendable,
        value: chartInventory.lendable,
      },
      ...payload.filter(({ value }) => value > 0),
    ].map((entry) => ({ ...entry, color: aboveTheLineColor }));
    const aboveTheLineKeys = [
      "name",
      ...aboveTheLine.map(({ dataKey }) => dataKey),
    ];
    const belowTheLine = Object.entries(chartInventory)
      .filter(([key]) => !aboveTheLineKeys.includes(key))
      .map(([key, value]) => ({
        dataKey: key,
        name: inventoryKeyToLabelMap[key],
        value,
        color: belowTheLineColor,
      }));
    const newPayload = [
      ...aboveTheLine,
      {}, // blank line
      { value: ">>> Additional Information <<<", color: belowTheLineColor },
      ...belowTheLine,
    ];

    // We render the default, but with our overridden payload.
    return <DefaultTooltipContent {...props} payload={newPayload} />;
  };

  return (
    <div className="library-stats">
      {library ? (
        <h2>{libraryName || libraryKey} Statistics</h2>
      ) : (
        <h2>Statistics for All Libraries</h2>
      )}
      <ul className="stats">
        <li className="stat-group">
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
        </li>
        <li className="stat-group">
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
        </li>
        <li className="stat-group">
          <h3>
            <span className="stat-grouping-label">Inventory</span>
          </h3>
          <ul>
            <SingleStatListItem
              label="Titles"
              value={inventory.titles}
              tooltip="Total number of books."
            />
            <SingleStatListItem
              label="Lendable titles"
              value={inventory.availableTitles}
              tooltip="Number of books available for checkout."
            />
            <SingleStatListItem
              label="Metered license titles"
              value={inventory.meteredLicenseTitles}
              tooltip="Number of books with a metered (counted) license."
            />
            <SingleStatListItem
              label="Unlimited license titles"
              value={inventory.unlimitedLicenseTitles}
              tooltip="Number of books for which there is no limit on the number of loans."
            />
            <SingleStatListItem
              label="Open access titles"
              value={inventory.openAccessTitles}
              tooltip="Number of books for which there are no limits on use."
            />
            <SingleStatListItem
              label="Self-hosted titles"
              value={inventory.selfHostedTitles}
              tooltip="Number of books hosted locally."
            />
          </ul>
        </li>
        <li className="stat-group stat-group-wide">
          {chartItems.length === 0 ? (
            <h3>No associated collections.</h3>
          ) : (
            <>
              <h3>
                <span className="stat-grouping-label">Collections</span>
              </h3>
              <ResponsiveContainer
                height={chartItems.length * 100 + 75}
                width={"100%"}
              >
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
                    textAnchor="end"
                    tick={{ dx: -20 }}
                    padding={{ top: 0, bottom: 0 }}
                    height={175}
                    width={125}
                  />
                  <XAxis type="number" />

                  <Tooltip
                    content={CustomTooltip}
                    formatter={formatNumber}
                    labelStyle={{
                      textDecoration: "underline",
                      fontWeight: "bold",
                    }}
                  />
                  <Bar
                    stackId="collections"
                    name={inventoryKeyToLabelMap.meteredLicense}
                    dataKey={"meteredLicense"}
                    barSize={50}
                    fill="#606060"
                  />
                  <Bar
                    stackId="collections"
                    name={inventoryKeyToLabelMap.unlimitedLicense}
                    dataKey={"unlimitedLicense"}
                    barSize={50}
                    fill="#404040"
                  />
                  <Bar
                    stackId="collections"
                    name={inventoryKeyToLabelMap.openAccess}
                    dataKey={"openAccess"}
                    barSize={50}
                    fill="#202020"
                  />
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
        </li>
      </ul>
    </div>
  );
};

export default LibraryStats;
