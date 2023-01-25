import * as React from "react";
import { LibraryStatsData, LibraryData } from "../interfaces";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import DefaultTooltipContent from "recharts/lib/component/DefaultTooltipContent";
import SingleStat from "./SingleStat";

export interface LibraryStatsProps {
  stats: LibraryStatsData;
  library?: LibraryData;
}

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
  // return !isNaN(Number(n))
  //   ? Intl.NumberFormat("en-US").format(n)
  //   : n === String(n)
  //   ? n
  //   : ""
  // ;
};

/** Displays statistics about patrons, licenses, and collections from the server,
 for a single library or all libraries the admin has access to. */
const LibraryStats = (props: LibraryStatsProps) => {
  const labeledCollectionCounts =
    props.stats &&
    props.stats.collections &&
    Object.entries(props.stats.collections).reduce((acc, [k, v]) => {
      acc[k] = {
        "Title Count": v.titles,
        "Lendable Titles": v.lendable_titles,
        "Open Access Titles": v.open_access_titles,
        "Licensed Titles": v.licensed_titles,
        "Unlimited License Titles": v.unlimited_license_titles,
        "Enumerated License Titles": v.enumerated_license_titles,
        "Enumerated Licenses Owned": v.licenses,
        "Enumerated Licenses Available": v.available_licenses,
        "Self-Hosted Titles": v.self_hosted_titles,
      };

      return acc;
    }, {});
  /* Customize the Rechart tooltip to provide additional information */
  const CustomTooltip = (props) => {
    const { active, payload, label: collection } = props;
    if (!active) return null;

    const color = "#A0A0A0";
    const nonZeroPayload = payload.filter((entry) => entry.value > 0);
    const payloadKeys = nonZeroPayload.map((entry) => entry.name);
    const addedPayload = Object.entries(labeledCollectionCounts[collection])
      .map(([name, value]) => {
        return { name, value, color };
      })
      .filter(({ name }) => {
        return !payloadKeys.includes(name);
      });
    const newPayload = [
      ...nonZeroPayload,
      {}, // blank line
      { value: ">>> Additional Information <<<", color },
      ...addedPayload,
    ];

    // we render the default, but with our overridden payload
    return <DefaultTooltipContent {...props} payload={newPayload} />;
  };
  const collectionCounts =
    props.stats &&
    props.stats.collections &&
    Object.keys(props.stats.collections).map((collection) => {
      const data = props.stats.collections[collection];
      return {
        label: collection,
        "Enumerated License Titles": data.enumerated_license_titles,
        "Unlimited License Titles": data.unlimited_license_titles,
        "Open Access Titles": data.open_access_titles,
      };
    });

  return (
    <div className="library-stats">
      {props.library ? (
        <h2>{props.library.name || props.library.short_name} Statistics</h2>
      ) : (
        <h2>Statistics for All Libraries</h2>
      )}
      {props.stats && (
        <ul className="stats">
          {props.stats.patrons.total > 0 && (
            <li className="stat-group">
              <h3>
                <span className="stat-grouping-label">Patrons</span>
              </h3>
              <ul>
                <SingleStat
                  label="Total Patrons"
                  value={props.stats.patrons.total}
                  tooltip="Total number of patrons."
                />
                <SingleStat
                  label="Patrons With Active Loans"
                  value={props.stats.patrons.with_active_loans}
                  tooltip="Number of patron with at least one active loan."
                />
                <SingleStat
                  label="Patrons With Active Loans or Holds"
                  value={props.stats.patrons.with_active_loans_or_holds}
                  tooltip="Number of patrons with at least one active loan or at least one hold."
                />
              </ul>
            </li>
          )}
          {props.stats.patrons.total > 0 && (
            <li className="stat-group">
              <h3>
                <span className="stat-grouping-label">Circulation</span>
              </h3>
              <ul>
                <SingleStat
                  label="Active Loans"
                  value={props.stats.patrons.loans}
                  tooltip="Total number of active loans for all patrons."
                />
                <SingleStat
                  label="Active Holds"
                  value={props.stats.patrons.holds}
                  tooltip="Total number of active holds for all patrons."
                />
              </ul>
            </li>
          )}
          <li className="stat-group">
            <h3>
              <span className="stat-grouping-label">Inventory</span>
            </h3>
            <ul>
              <SingleStat
                label="Titles"
                value={props.stats.inventory.titles}
                tooltip="Total number of titles."
              />
              <SingleStat
                label="Enumerated license titles"
                value={props.stats.inventory.enumerated_license_titles}
                tooltip="Number of titles for which a specific number of licenses is allocated."
              />
              <SingleStat
                label="Unlimited license titles"
                value={props.stats.inventory.unlimited_license_titles}
                tooltip="Number of titles for which there is no limit on the number of licenses."
              />
              <SingleStat
                label="Open access titles"
                value={props.stats.inventory.open_access_titles}
                tooltip="Number of titles for which there are no limits on use."
              />
              <SingleStat
                label="Self-hosted titles"
                value={props.stats.inventory.self_hosted_titles}
                tooltip="Number of titles hosted locally."
              />
            </ul>
          </li>
          <li className="stat-group">
            <h3>
              <span className="stat-grouping-label">Enumerated Licenses</span>
            </h3>
            <ul>
              <SingleStat
                label="Enumerated license titles"
                value={props.stats.inventory.enumerated_license_titles}
                tooltip="Number of titles for which a specific number of licenses is allocated."
              />
            </ul>
            {props.stats.inventory.enumerated_license_titles > 0 && (
              <ul>
                <SingleStat
                  label="Total Licenses"
                  value={props.stats.inventory.licenses}
                  tooltip="Total number of licenses allocated for those titles for which licenses are counted."
                />
                <SingleStat
                  label="Available Licenses"
                  value={props.stats.inventory.available_licenses}
                  tooltip="Total number of allocated licenses that are currently available."
                />
              </ul>
            )}
          </li>
          {collectionCounts.length > 0 && (
            <li className="stat-group stat-group-wide">
              <h3>
                <span className="stat-grouping-label">Collections</span>
              </h3>
              <ResponsiveContainer
                height={collectionCounts.length * 100}
                width={"100%"}
              >
                <BarChart
                  data={collectionCounts}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 0, bottom: 50 }}
                >
                  <YAxis
                    type="category"
                    dataKey="label"
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
                    dataKey="Enumerated License Titles"
                    barSize={50}
                    fill="#606060"
                  />
                  <Bar
                    stackId="collections"
                    dataKey="Unlimited License Titles"
                    barSize={50}
                    fill="#404040"
                  />
                  <Bar
                    stackId="collections"
                    dataKey="Open Access Titles"
                    barSize={50}
                    fill="#202020"
                  />
                </BarChart>
              </ResponsiveContainer>
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default LibraryStats;
