import * as React from "react";
import { Store } from "redux";
import { connect } from "react-redux";
import ActionCreator from "../actions";
import { FetchErrorData } from "opds-web-client/lib/interfaces";
import { StatsData } from "../interfaces";
import { State } from "../reducers/index";
import LoadingIndicator from "opds-web-client/lib/components/LoadingIndicator";
import ErrorMessage from "./ErrorMessage";

export interface StatsProps {
  store?: Store<State>;
  stats?: StatsData;
  fetchError?: FetchErrorData;
  fetchStats?: () => Promise<any>;
  isLoaded?: boolean;
}

export class Stats extends React.Component<StatsProps, any> {

  render(): JSX.Element {
    let patronCounts = [
      { key: "total", label: "Total Patrons" },
      { key: "with_active_loans", label: "Patrons with Active Loans" },
      { key: "with_active_loans_or_holds", label : "Patrons with Active Loans or Holds" },
      { key: "loans", label: "Active Loans" },
      { key: "holds", label: "Active Holds" }
    ].map(countInfo => {
      return {
        label: countInfo.label,
        count: this.props.stats ? this.props.stats.patrons[countInfo.key] : 0
      };
    });

    let vendorCounts = [
      { key: "overdrive", label: "Overdrive" },
      { key: "bibliotheca", label: "Bibliotheca" },
      { key: "axis360", label: "Axis 360" },
      { key: "open_access", label: "Open Access" }
    ].map(vendor => {
      return {
        label: vendor.label,
        count: this.props.stats ? this.props.stats.vendors[vendor.key] : 0
      };
    }).filter(vendor => {
      return vendor.count && vendor.count > 0;
    });

    return (
      <div>
        { this.props.fetchError &&
          <ErrorMessage error={this.props.fetchError} />
        }

        { !this.props.isLoaded &&
          <LoadingIndicator />
        }

        { this.props.isLoaded && this.props.stats &&
          <div className="stats">
            <ul className="list-inline">
              <li><div className="stat-grouping-label">Patrons</div></li>
              { patronCounts.map(patronCount =>
                <li>
                  <div>{patronCount.label}:</div>
                  <div className="stat-value">{patronCount.count}</div>
                </li>
              ) }
            </ul>
            <ul className="list-inline">
              <li><div className="stat-grouping-label">Inventory</div></li>
              <li>
                <div>Total Titles:</div>
                <div className="stat-value">{this.props.stats.inventory.titles}</div>
              </li>
              <li>
                <div>Total Licenses:</div>
                <div className="stat-value">{this.props.stats.inventory.licenses}</div>
              </li>
              <li>
                <div>Available Licenses:</div>
                <div className="stat-value">{Math.round(this.props.stats.inventory.available_licenses * 100 / this.props.stats.inventory.licenses)}%</div>
              </li>
            </ul>
            <ul className="list-inline">
              <li><div className="stat-grouping-label">Vendors</div></li>
              { vendorCounts.map(vendor =>
                <li>
                  <div>{vendor.label} Titles:</div>
                  <div className="stat-value">{vendor.count}</div>
                </li>
              ) }
            </ul>
          </div>
        }
      </div>
    );
  }

  componentWillMount() {
    if (this.props.fetchStats) {
      this.props.fetchStats();
    }
  }
}

function mapStateToProps(state, ownProps) {
  return {
    stats: state.editor.stats.data,
    fetchError: state.editor.stats.fetchError,
    isLoaded: state.editor.stats.isLoaded
  };
}

function mapDispatchToProps(dispatch) {
  let actions = new ActionCreator();
  return {
    fetchStats: () => dispatch(actions.fetchStats())
  };
}

const ConnectedStats = connect<any, any, any>(
  mapStateToProps,
  mapDispatchToProps
)(Stats);

export default ConnectedStats;