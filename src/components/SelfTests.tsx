import * as React from "react";
import { Store } from "redux";
import { connect } from "react-redux";
import { State } from "../reducers/index";
import ActionCreator from "../actions";
import { ServiceData, SelfTestsData } from "../interfaces";

import DataFetcher from "opds-web-client/lib/DataFetcher";

import {
  CheckSoloIcon,
  XIcon,
} from "@nypl/dgx-svg-icons";

export interface SelfTestsStateProps {
  item: ServiceData;
}

export interface SelfTestsDispatchProps {
  runSelfTests?: () => Promise<void>;
  getSelfTests?: () => Promise<SelfTestsData>;
}

export interface SelfTestsOwnProps {
  store?: Store<State>;
}

export interface SelfTestsProps extends React.Props<SelfTestsProps>, SelfTestsStateProps, SelfTestsDispatchProps, SelfTestsOwnProps {}

export interface SelfTestsState {
  expand: boolean;
}

export class SelfTests extends React.Component<SelfTestsProps, SelfTestsState> {
  constructor(props) {
    super(props);

    this.state = { expand: false };
    this.toggleView = this.toggleView.bind(this);
    this.runSelfTests = this.runSelfTests.bind(this);
  }

  render() {
    const integration = this.props.item;
    const expand = this.state.expand;

    if (!integration || !integration.self_test_results) {
      return null;
    }
    const date = new Date(integration.self_test_results.start);
    const startDate = date.toDateString();
    const hours = ("0" + date.getHours()).slice(-2);
    const minutes = ("0" + date.getMinutes()).slice(-2);
    const seconds = ("0" + date.getSeconds()).slice(-2);
    const startTime = `${hours}:${minutes}:${seconds}`;

    const expandResultClass = expand ? "active" : "";
    const resultsLabel = expand ? "Collapse" : "Expand";
    const results = integration.self_test_results && integration.self_test_results.results;
    const findFailures = (result) => !result.success;
    const oneFailedResult = results.some(findFailures);
    const resultIcon = oneFailedResult ? <XIcon className="failure" /> : <CheckSoloIcon className="success" />;
    const duration = integration.self_test_results.duration.toFixed(2);

    return (
      <div className="integration-selftests">
        <div>
          {resultIcon}
          <p className="description">Tests last ran on {startDate} {startTime} and lasted {duration}s.</p>
          <button onClick={this.toggleView} className="btn btn-default">{resultsLabel} Results</button>
        </div>
        <div className={`results collapse ${expandResultClass}`}>
          <h3>Self Test Results</h3>
          <button onClick={(e) => this.runSelfTests(e)} className="btn btn-default runSelfTests">
            Run tests
          </button>

          <ul>
            {
              results.map(result => {
                const successColor = result.success ? "success" : "failure";
                return (
                  <li className={successColor} key={result.name}>
                    <h4>{result.name}</h4>
                    {
                      result.result ?
                        <p className="result-description">result: {result.result}</p>
                        : null
                    }
                    <p className="success-description">
                      success: {`${result.success}`}
                    </p>
                    {
                      !result.success && (
                        <p className="exception-description">
                          exception: {result.exception.message}
                        </p>
                      )
                    }
                  </li>
                );
              })
            }
          </ul>
        </div>
      </div>
    );
  }

  toggleView() {
    this.setState({ expand: !this.state.expand });
  }

  async runSelfTests(e) {
    e.preventDefault();
    await this.props.runSelfTests();
    this.props.getSelfTests();
  }
}

function mapStateToProps(state, ownProps) {
  const stateResults = state.editor.selfTests &&
    state.editor.selfTests.data && state.editor.selfTests.data.collection;
  const propsResults = ownProps.item && ownProps.item;
  let item = propsResults;

  if (stateResults && stateResults.id === propsResults.id) {
    item = stateResults;
  }

  return {
    item,
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  let fetcher = new DataFetcher();
  let actions = new ActionCreator(fetcher, ownProps.csrfToken);
  const integration = ownProps.item.id;

  return {
    getSelfTests: () => dispatch(actions.getSelfTests(integration)),
    runSelfTests: () => dispatch(actions.runSelfTests(integration))
  };
}

const ConnectedSelfTests = connect<SelfTestsStateProps, SelfTestsDispatchProps, SelfTestsOwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(SelfTests);

export default ConnectedSelfTests;
