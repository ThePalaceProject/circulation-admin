import * as React from "react";
import { Store } from "redux";
import { connect } from "react-redux";
import { State } from "../reducers/index";
import ActionCreator from "../actions";
import { ServiceData, SelfTestsData } from "../interfaces";
import ErrorMessage from "./ErrorMessage";
import { FetchErrorData } from "opds-web-client/lib/interfaces";

import DataFetcher from "opds-web-client/lib/DataFetcher";

import {
  CheckSoloIcon,
  XIcon,
} from "@nypl/dgx-svg-icons";

export interface SelfTestsStateProps {
  item?: ServiceData;
  isFetching?: boolean;
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
  runTests: boolean;
  error: FetchErrorData;
}

export class SelfTests extends React.Component<SelfTestsProps, SelfTestsState> {
  constructor(props) {
    super(props);

    this.state = {
      expand: false,
      runTests: false,
      error: null,
    };
    this.toggleView = this.toggleView.bind(this);
    this.runSelfTests = this.runSelfTests.bind(this);
  }

  render() {
    const integration = this.props.item;
    const expand = this.state.expand;
    const selfTestException = integration.self_test_results && integration.self_test_results.exception;
    let date;
    let startDate;
    let hours;
    let minutes;
    let seconds;
    let startTime;
    let results = [];
    let duration;

    if (integration.self_test_results && !selfTestException) {
      date = new Date(integration.self_test_results.start);
      startDate = date.toDateString();
      hours = ("0" + date.getHours()).slice(-2);
      minutes = ("0" + date.getMinutes()).slice(-2);
      seconds = ("0" + date.getSeconds()).slice(-2);
      startTime = `${hours}:${minutes}:${seconds}`;
      results = integration.self_test_results.results || [];
      duration = integration.self_test_results.duration && integration.self_test_results.duration.toFixed(2);
    }
    const expandResultClass = expand ? "active" : "";
    const resultsLabel = expand ? "Collapse" : "Expand";
    const findFailures = (result) => !result.success;
    const oneFailedResult = results.some(findFailures);
    const resultIcon = oneFailedResult ? <XIcon className="failure" /> : <CheckSoloIcon className="success" />;
    const isFetching = !!(this.props.isFetching && this.state.runTests);
    const testDescription = integration.self_test_results ?
      `Tests last ran on ${startDate} ${startTime} and lasted ${duration}s.` :
      "No self test results found.";
    const failedSelfTest = selfTestException ? selfTestException : "";

    return (
      <div className="integration-selftests">
        <div>
          {results.length ? resultIcon : null}
          <p className="description">{failedSelfTest ? failedSelfTest : testDescription}</p>
          <button onClick={this.toggleView} className="btn btn-default">{resultsLabel} Results</button>
        </div>
        <div className={`results collapse ${expandResultClass}`}>
          <h4>Self Test Results</h4>
          {isFetching &&
            <span>Running new self tests</span>
          }
          <button
            onClick={(e) => this.runSelfTests(e)}
            className="btn btn-default runSelfTests"
            disabled={this.props.isFetching}
          >
            Run tests
          </button>

          {
            this.state.error &&
              <ErrorMessage error={this.state.error} />
          }

          {
            integration.self_test_results &&
              <ul>
                {
                  results.map(result => {
                    const colorResultClass = result.success ? "success" : "failure";
                    return (
                      <li className={isFetching ? "loading-self-test" : colorResultClass} key={result.name}>
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
          }
        </div>
      </div>
    );
  }

  toggleView() {
    this.setState({
      expand: !this.state.expand,
      runTests: this.state.runTests,
      error: null,
    });
  }

  async runSelfTests(e) {
    e.preventDefault();
    this.setState({
      expand: this.state.expand,
      runTests: true,
      error: null,
    });

    try {
      await this.props.runSelfTests();
      this.props.getSelfTests();
      this.setState({
        expand: this.state.expand,
        runTests: false,
        error: null,
      });
    } catch (error) {
      this.setState({
        expand: this.state.expand,
        runTests: false,
        error: error,
      });
    }
  }
}

function mapStateToProps(state, ownProps) {
  const selfTests = state.editor.selfTests;
  return {
    isFetching: selfTests.isFetching,
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  let fetcher = new DataFetcher();
  let actions = new ActionCreator(fetcher, ownProps.csrfToken);
  const integrationId = ownProps.item.id;
  const url = `/admin/collection_self_tests/${integrationId}`;

  return {
    getSelfTests: () => dispatch(actions.getSelfTests(url)),
    runSelfTests: () => dispatch(actions.runSelfTests(url))
  };
}

const ConnectedSelfTests = connect<SelfTestsStateProps, SelfTestsDispatchProps, SelfTestsOwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(SelfTests);

export default ConnectedSelfTests;
