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
              <li>
                <div>Total Patrons:</div>
                <div className="stat-value">{this.props.stats.patrons.total}</div>
              </li>
              <li>
                <div>Patrons with Active Loans:</div>
                <div className="stat-value">{this.props.stats.patrons.with_active_loans}</div>
              </li>
              <li>
                <div>Patrons with Active Loans or Holds:</div>
                <div className="stat-value">{this.props.stats.patrons.with_active_loans_or_holds}</div>
              </li>
              <li>
                <div>Active Loans:</div>
                <div className="stat-value">{this.props.stats.patrons.loans}</div>
              </li>
              <li>
                <div>Active Holds:</div>
                <div className="stat-value">{this.props.stats.patrons.holds}</div>
              </li>
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
              { this.props.stats.vendors.overdrive > 0 ?
                <li>
                  <div>Overdrive Titles:</div>
                  <div className="stat-value">{this.props.stats.vendors.overdrive}</div>
                </li> : null
              }
              { this.props.stats.vendors.bibliotheca > 0 ?
                <li>
                  <div>Bibliotheca Titles:</div>
                  <div className="stat-value">{this.props.stats.vendors.bibliotheca}</div>
                </li> : null
              }
              { this.props.stats.vendors.axis360 > 0 ?
                <li>
                  <div>Axis 360 Titles:</div>
                  <div className="stat-value">{this.props.stats.vendors.axis360}</div>
                </li> : null
              }
              { this.props.stats.vendors.open_access > 0 ?
                <li>
                  <div>Open Access Titles:</div>
                  <div className="stat-value">{this.props.stats.vendors.open_access}</div>
                </li> : null
              }
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