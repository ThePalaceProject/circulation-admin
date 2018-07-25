import * as React from "react";
import { LibraryStatsData, LibraryData } from "../interfaces";
import {
  BarChart, XAxis, YAxis, Tooltip, Bar
} from "recharts";
import * as numeral from "numeral";

export interface LibraryStatsProps {
  stats: LibraryStatsData;
  library?: LibraryData;
}

/** Displays statistics about patrons, licenses, and collections from the server,
    for a single library or all libraries the admin has access to. */
export default class LibraryStats extends React.Component<LibraryStatsProps, void> {
  render(): JSX.Element {
    const collectionCounts = this.props.stats && this.props.stats.collections && Object.keys(this.props.stats.collections).map(collection => {
      const data = this.props.stats.collections[collection];
      return {
        label: collection,
        // The "Titles" key is displayed in the default recharts tooltip.
        "Open Access Titles": data.open_access_titles,
        "Licensed Titles": data.licensed_titles
      };
    }).filter(collection => {
      let open_access = collection["Open Access Titles"];
      let licensed = collection["Licensed Titles"];
      return (open_access && open_access > 0) || (licensed && licensed > 0);
    });

    return (
      <div className="library-stats">
        { this.props.library ?
          <h2>{this.props.library.name || this.props.library.short_name} Statistics</h2> :
          <h2>Statistics for All Libraries</h2>
        }
        { this.props.stats &&
          <ul className="stats">
            { this.props.stats.patrons.total > 0 &&
              <li className="stat-group">
                <h3><span className="stat-grouping-label">Patrons</span></h3>
                <ul>
                  <li className="single-stat">
                    <span className="stat-value">{this.formatNumber(this.props.stats.patrons.total)}</span>
                    <span className="stat-label">Total Patrons</span>
                  </li>
                  <li className="single-stat">
                    <span className="stat-value">{this.formatNumber(this.props.stats.patrons.with_active_loans)}</span>
                    <span className="stat-label">Patrons With Active Loans</span>
                  </li>
                  <li className="single-stat">
                    <span className="stat-value">{this.formatNumber(this.props.stats.patrons.with_active_loans_or_holds)}</span>
                    <span className="stat-label">Patrons With Active Loans or Holds</span>
                  </li>
                </ul>
              </li>
            }
            { this.props.stats.patrons.total > 0 &&
              <li className="stat-group">
                <h3><span className="stat-grouping-label">Circulation</span></h3>
                <ul>
                  <li className="single-stat">
                    <div className="stat-value">{this.formatNumber(this.props.stats.patrons.loans)}</div>
                    <div className="stat-label">Active Loans</div>
                  </li>
                  <li className="single-stat">
                    <div className="stat-value">{this.formatNumber(this.props.stats.patrons.holds)}</div>
                    <div className="stat-label">Active Holds</div>
                  </li>
                </ul>
              </li>
            }
            <li className="stat-group">
              <h3><span className="stat-grouping-label">Inventory</span></h3>
              <ul>
                <li className="single-stat">
                  <div className="stat-value">{this.formatNumber(this.props.stats.inventory.titles)}</div>
                  <div className="stat-label">Titles</div>
                </li>
                { this.props.stats.inventory.licenses > 0 &&
                  <li className="single-stat">
                    <div className="stat-value">{this.formatNumber(this.props.stats.inventory.licenses)}</div>
                    <div className="stat-label">Total Licenses</div>
                  </li>
                }
                { this.props.stats.inventory.licenses > 0 &&
                  <li className="single-stat">
                    <div className="stat-value">{this.formatNumber(this.props.stats.inventory.available_licenses)}</div>
                    <div className="stat-label">Available Licenses</div>
                  </li>
                }
              </ul>
            </li>
            { collectionCounts.length > 0 &&
              <li className="stat-group stat-group-wide">
                <h3><span className="stat-grouping-label">Collections</span></h3>
                <BarChart width={collectionCounts.length * 100} height={350} data={collectionCounts}>
                  <XAxis dataKey="label" interval={0} angle={-45} textAnchor="end" padding={{ left: 50, right: 50 }} height={175} />
                  <YAxis hide={true} />
                  <Tooltip />
                  <Bar stackId="collections" dataKey="Licensed Titles" barSize={50} fill="#737373" />
                  <Bar stackId="collections" dataKey="Open Access Titles" barSize={50} fill="#000000" />
                </BarChart>
              </li>
            }
          </ul>
        }
      </div>
    );
  }

  formatNumber(n) {
    return n ? numeral(n).format("0.[0]a") : 0;
  }
}
