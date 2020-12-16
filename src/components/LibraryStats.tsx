import * as React from "react";
import { LibraryStatsData, LibraryData } from "../interfaces";
import { BarChart, XAxis, YAxis, Tooltip, Bar } from "recharts";
import * as numeral from "numeral";
import SingleStat from "./SingleStat";

export interface LibraryStatsProps {
  stats: LibraryStatsData;
  library?: LibraryData;
}

/** Displays statistics about patrons, licenses, and collections from the server,
    for a single library or all libraries the admin has access to. */
export default class LibraryStats extends React.Component<
  LibraryStatsProps,
  {}
> {
  render(): JSX.Element {
    const collectionCounts =
      this.props.stats &&
      this.props.stats.collections &&
      Object.keys(this.props.stats.collections)
        .map(collection => {
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
                  <SingleStat label="Total Patrons" value={this.formatNumber(this.props.stats.patrons.total)}
                              tooltip="Total number of patrons." />
                  <SingleStat label="Patrons With Active Loans"
                              value={this.formatNumber(this.props.stats.patrons.with_active_loans)}
                              tooltip="Number of patron with at least one active loan." />
                  <SingleStat label="Patrons With Active Loans or Holds"
                              value={this.formatNumber(this.props.stats.patrons.with_active_loans_or_holds)}
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
                  <SingleStat label="Active Loans" value={this.formatNumber(this.props.stats.patrons.loans)}
                              tooltip="Total number of active loans for all patrons." />
                  <SingleStat label="Active Holds" value={this.formatNumber(this.props.stats.patrons.holds)}
                              tooltip="Total number of active holds for all patrons." />
                </ul>
              </li>
            )}
            <li className="stat-group">
              <h3>
                <span className="stat-grouping-label">Inventory</span>
              </h3>
              <ul>
                <SingleStat label="Titles" value={this.formatNumber(this.props.stats.inventory.titles)}
                            tooltip="Total number of titles." />
                <SingleStat label="Enumerated license titles"
                            value={this.formatNumber(this.props.stats.inventory.enumerated_license_titles)}
                            tooltip="Number of titles for which a specific number of licenses is allocated." />
                <SingleStat label="Unlimited license titles"
                            value={this.formatNumber(this.props.stats.inventory.unlimited_license_titles)}
                            tooltip="Number of titles for which there is no limit on the number of licenses." />
                <SingleStat label="Open access titles"
                            value={this.formatNumber(this.props.stats.inventory.open_access_titles)}
                            tooltip="Number of titles for which there are no limits on use." />
              </ul>
            </li>
            <li className="stat-group">
              <h3><span className="stat-grouping-label">Enumerated Licenses</span></h3>
              <ul>
                { this.props.stats.inventory.licenses > 0 &&
                  <SingleStat label="Total Licenses" value={this.formatNumber(this.props.stats.inventory.licenses)}
                              tooltip="Total number of licenses allocated for those titles for which licenses are counted." />
                }
                { this.props.stats.inventory.licenses > 0 &&
                  <SingleStat label="Available Licenses"
                              value={this.formatNumber(this.props.stats.inventory.available_licenses)}
                              tooltip="Total number of allocated licenses that are currently available." />
                }
              </ul>
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
                  <Tooltip
                    formatter={(value) => new Intl.NumberFormat('en').format(value)}
                    labelStyle={{ 'text-decoration': 'underline' }}
                  />
                  {/*<Bar stackId="collections" dataKey="Licensed Titles" barSize={50} fill="#737373" />*/}
                  <Bar
                    stackId="collections"
                    dataKey="Enumerated License Titles"
                    barSize={50}
                    fill="#404040"
                    />
                  <Bar
                    stackId="collections"
                    dataKey="Unlimited License Titles"
                    barSize={50}
                    fill="#808080"
                  />
                  <Bar
                    stackId="collections"
                    dataKey="Open Access Titles"
                    barSize={50} fill="#000000"
                  />
                </BarChart>
              </li>
            )}
          </ul>
        )}
      </div>
    );
  }

  formatNumber(n) {
    return n ? numeral(n).format("0.[0]a") : 0;
  }
}
