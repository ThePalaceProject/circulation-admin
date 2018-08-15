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
}

export class SelfTests extends React.Component<SelfTestsProps, SelfTestsState> {
  constructor(props) {
    super(props);

    this.state = {
      expand: false,
      runTests: false,
    };
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
    const isFetching = !!(this.props.isFetching && this.state.runTests);

    return (
      <div className="integration-selftests">
        <div>
          {resultIcon}
          <p className="description">Tests last ran on {startDate} {startTime} and lasted {duration}s.</p>
          <button onClick={this.toggleView} className="btn btn-default">{resultsLabel} Results</button>
        </div>
        <div className={`results collapse ${expandResultClass}`}>
          <h3>Self Test Results</h3>
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
        </div>
      </div>
    );
  }

  toggleView() {
    this.setState({
      expand: !this.state.expand,
      runTests: this.state.runTests,
    });
  }

  async runSelfTests(e) {
    e.preventDefault();
    this.setState({
      expand: this.state.expand,
      runTests: true,
    });

    await this.props.runSelfTests();
    this.props.getSelfTests();

    this.setState({
      expand: this.state.expand,
      runTests: false,
    });
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
