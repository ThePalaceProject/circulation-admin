import * as React from "react";
import { LibraryStatsData, LibraryData } from "../interfaces";
import {
  BarChart, XAxis, YAxis, Tooltip, Bar
} from "recharts";
import DefaultTooltipContent from 'recharts/lib/component/DefaultTooltipContent';
import SingleStat from "./SingleStat";

export interface LibraryStatsProps {
  stats: LibraryStatsData;
  library?: LibraryData;
}

const formatNumber = ((n: number | null): string => {
  // Use non-strict check to get null or undefined.
  return n != null ? Intl.NumberFormat("en-US").format(n) : "";
});

/** Displays statistics about patrons, licenses, and collections from the server,
    for a single library or all libraries the admin has access to. */
export default class LibraryStats extends React.Component<
  LibraryStatsProps,
  {}
> {
  render(): JSX.Element {
    const labeledCollectionCounts = this.props.stats && this.props.stats.collections &&
      Object.entries(this.props.stats.collections)
        .reduce((acc, [k, v]) => {
          acc[k] = {
            "Title Count": v.titles,
            "Self-Hosted Titles": v.self_hosted_titles,
            "Open Access Titles": v.open_access_titles,
            "Licensed Titles": v.licensed_titles,
            "Unlimited License Titles": v.unlimited_license_titles,
            "Enumerated License Titles": v.enumerated_license_titles,
            "Enumerated Licenses Owned": v.licenses,
            "Enumerated Licenses Available": v.available_licenses,
          }
          return acc;
        }, {});

    const CustomTooltip = props => {
      const { active, payload, label: collection } = props;
      if (!active) return null;

      const color = "#A0A0A0";
      const nonZeroPayload = payload.filter(entry => entry.value > 0);
      const payloadKeys = nonZeroPayload.map(entry => entry.name);
      const addedPayload = Object.entries(labeledCollectionCounts[collection])
          .map(([name, value]) => {
        return { name, value, color };
      }).filter(({name}) => {
        return !payloadKeys.includes(name);
      });
      const newPayload = [
        ...nonZeroPayload,
        {}, // blank line
        { name: ": Additional Information", color},
        ...addedPayload,
      ];

      // we render the default, but with our overridden payload
      return <DefaultTooltipContent {...props} payload={newPayload} />;
    };
    const collectionCounts = this.props.stats && this.props.stats.collections && Object.keys(this.props.stats.collections).map(collection => {
      const data = this.props.stats.collections[collection];
      return {
        label: collection,
        // The "Titles" key is displayed in the default recharts tooltip.
        "Open Access Titles": data.open_access_titles,
        "Licensed Titles": data.licensed_titles,
        "Enumerated License Titles": data.enumerated_license_titles,
        "Unlimited License Titles": data.unlimited_license_titles,
      };
    }).filter(collection => {
      let open_access = collection["Open Access Titles"];
      let licensed = collection["Licensed Titles"];
      return (open_access && open_access > 0) || (licensed && licensed > 0);
    });

    return (
      <div className="library-stats">
        {this.props.library ? (
          <h2>
            {this.props.library.name || this.props.library.short_name}{" "}
            Statistics
          </h2>
        ) : (
          <h2>Statistics for All Libraries</h2>
        )}
        {this.props.stats && (
          <ul className="stats">
            {this.props.stats.patrons.total > 0 && (
              <li className="stat-group">
                <h3>
                  <span className="stat-grouping-label">Patrons</span>
                </h3>
                <ul>
                  <SingleStat label="Total Patrons" value={this.props.stats.patrons.total}
                              tooltip="Total number of patrons." />
                  <SingleStat label="Patrons With Active Loans"
                              value={this.props.stats.patrons.with_active_loans}
                              tooltip="Number of patron with at least one active loan." />
                  <SingleStat label="Patrons With Active Loans or Holds"
                              value={this.props.stats.patrons.with_active_loans_or_holds}
                              tooltip="Number of patrons with at least one active loan or at least one hold."  />
                </ul>
              </li>
            )}
            {this.props.stats.patrons.total > 0 && (
              <li className="stat-group">
                <h3>
                  <span className="stat-grouping-label">Circulation</span>
                </h3>
                <ul>
                  <SingleStat label="Active Loans" value={this.props.stats.patrons.loans}
                              tooltip="Total number of active loans for all patrons." />
                  <SingleStat label="Active Holds" value={this.props.stats.patrons.holds}
                              tooltip="Total number of active holds for all patrons." />
                </ul>
              </li>
            )}
            <li className="stat-group">
              <h3>
                <span className="stat-grouping-label">Inventory</span>
              </h3>
              <ul>
                <SingleStat label="Titles" value={this.props.stats.inventory.titles}
                            tooltip="Total number of titles." />
                <SingleStat label="Enumerated license titles"
                            value={this.props.stats.inventory.enumerated_license_titles}
                            tooltip="Number of titles for which a specific number of licenses is allocated." />
                <SingleStat label="Unlimited license titles"
                            value={this.props.stats.inventory.unlimited_license_titles}
                            tooltip="Number of titles for which there is no limit on the number of licenses." />
                <SingleStat label="Open access titles"
                            value={this.props.stats.inventory.open_access_titles}
                            tooltip="Number of titles for which there are no limits on use." />
                <SingleStat label="Self-hosted titles"
                            value={this.props.stats.inventory.self_hosted_titles}
                            tooltip="Number of titles hosted locally." />
              </ul>
            </li>
            <li className="stat-group">
              <h3><span className="stat-grouping-label">Enumerated Licenses</span></h3>
              <ul>
                <SingleStat label="Enumerated license titles"
                            value={this.props.stats.inventory.enumerated_license_titles}
                            tooltip="Number of titles for which a specific number of licenses is allocated." />
              </ul>
              { this.props.stats.inventory.enumerated_license_titles > 0 &&
                <ul>
                  <SingleStat label="Total Licenses" value={this.props.stats.inventory.licenses}
                              tooltip="Total number of licenses allocated for those titles for which licenses are counted."/>
                  <SingleStat label="Available Licenses"
                              value={this.props.stats.inventory.available_licenses}
                              tooltip="Total number of allocated licenses that are currently available."/>
                </ul>
              }
            </li>
            {collectionCounts.length > 0 && (
              <li className="stat-group stat-group-wide">
                <h3>
                  <span className="stat-grouping-label">Collections</span>
                </h3>
                <BarChart
                  width={collectionCounts.length * 100}
                  height={350}
                  data={collectionCounts}
                >
                  <XAxis
                    dataKey="label"
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    padding={{ left: 50, right: 50 }}
                    height={175}
                  />
                  <YAxis hide={true} />
                  <Tooltip content={CustomTooltip} formatter={formatNumber}
                           labelStyle={{ "text-decoration": "underline" }}/>
                  <Bar stackId="collections" dataKey="Enumerated License Titles" barSize={50} fill="#606060" />
                  <Bar stackId="collections" dataKey="Unlimited License Titles" barSize={50} fill="#404040" />
                  <Bar stackId="collections" dataKey="Open Access Titles" barSize={50} fill="#202020"/>
                </BarChart>
              </li>
            )}
          </ul>
        )}
      </div>
    );
  }
}
