import * as React from "react";
import { Store } from "redux";
import { connect } from "react-redux";
import { State } from "../reducers/index";
import ActionCreator from "../actions";
import { ServiceData, SelfTestsData, SelfTestsResult } from "../interfaces";
import ErrorMessage from "./ErrorMessage";
import { FetchErrorData } from "opds-web-client/lib/interfaces";
import SelfTestResult from "./SelfTestResult";
import DataFetcher from "opds-web-client/lib/DataFetcher";
import { Panel, Button } from "library-simplified-reusable-components";

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
  type: string;
  sortByCollection: boolean;
}

export interface SelfTestsProps extends React.Props<SelfTestsProps>, SelfTestsStateProps, SelfTestsDispatchProps, SelfTestsOwnProps {}

export interface SelfTestsState {
  runTests: boolean;
  error: FetchErrorData;
  mostRecent?: ServiceData;
}

export class SelfTests extends React.Component<SelfTestsProps, SelfTestsState> {
  static defaultProps = {
    sortByCollection: false
  };
  constructor(props: SelfTestsProps) {
    super(props);

    this.state = {
      runTests: false,
      error: null,
      mostRecent: this.props.item
    };
    this.runSelfTests = this.runSelfTests.bind(this);
    this.displayByCollection = this.displayByCollection.bind(this);
  }

  componentDidMount() {
    this.props.getSelfTests();
  }

  componentWillReceiveProps(nextProps: SelfTestsProps) {
    let newTime = nextProps.item && nextProps.item.self_test_results && nextProps.item.self_test_results.start;
    let oldTime = this.props.item && this.props.item.self_test_results && this.props.item.self_test_results.start;
    if (!oldTime || (newTime > oldTime)) {
      this.setState({ mostRecent: nextProps.item });
    }
  }

  render(): JSX.Element {
    const integration: ServiceData = this.state.mostRecent;
    const selfTestException = integration.self_test_results && integration.self_test_results.exception;
    const firstTime: boolean = selfTestException && selfTestException.includes("no attribute 'prior_test_results'");
    let results = [];
    let resultIcon: JSX.Element;
    let testDescription: string;
    if (firstTime) {
      testDescription = "There are no self test results yet.";
    } else {
      testDescription = integration.self_test_results && integration.self_test_results.start ?
      this.formatDate(integration) : "No self test results found.";
    }
    if (integration.self_test_results && !selfTestException) {
      results = integration.self_test_results.results || [];
      const findFailures = (result) => !result.success;
      const oneFailedResult = results.some(findFailures);
      resultIcon = oneFailedResult ? <XIcon className="failure" /> : <CheckSoloIcon className="success" />;
    }
    const isFetching = !!(this.props.isFetching && this.state.runTests);
    const failedSelfTest = (selfTestException && !firstTime) ? selfTestException : "";

    const runButton = (
      <Button
        callback={(e) => this.runSelfTests(e)}
        disabled={this.props.isFetching}
        content="Run tests"
      />
    );

    let resultList: JSX.Element[] = results.length ? results.map((result, idx) => this.makeResult(result, idx, isFetching)) : null;
    let collectionList = this.props.sortByCollection && this.displayByCollection(results, isFetching);

    return (
      <div className="integration-selftests">
        <div>
          {results.length ? resultIcon : null}
          <p className="description">{failedSelfTest ? failedSelfTest : testDescription}</p>
        </div>
        { runButton }
        <div className="results">
          {isFetching &&
            <span>Running new self tests</span>
          }
          {
            this.state.error &&
            <ErrorMessage error={this.state.error} />
          }
          {
            resultList && <ul><h4>Self Test Results</h4>{collectionList || resultList}</ul>
          }
        </div>
      </div>
    );
  }

  formatDate(integration: ServiceData): string {
    const date = new Date(integration.self_test_results.start);
    const startDate = date.toDateString();
    let format = (x) => `0${x}`.slice(-2);
    const [hours, minutes, seconds] = [format(date.getHours()), format(date.getMinutes()), format(date.getSeconds())];
    const startTime = `${hours}:${minutes}:${seconds}`;
    const duration = integration.self_test_results.duration && integration.self_test_results.duration.toFixed(2);
    return `Tests last ran on ${startDate} ${startTime} and lasted ${duration}s.`;
  }

  makeResult(result: SelfTestsResult, idx: Number, isFetching: boolean) {
    return <SelfTestResult key={`${result.collection}-${idx}`} result={result} isFetching={isFetching} />;
  }

  displayByCollection(results: SelfTestsResult[], isFetching: boolean): JSX.Element[] {
    let collectionList: JSX.Element[];
    let sorted = {};
    // The initial set-up test's collection property is always undefined
    let isInitial = (c: string) => c === "undefined";
    // Group the results by their collections
    results.forEach(r => sorted[r.collection] = results.filter(result => result.collection === r.collection));
    let content = (resultsForCollection: SelfTestsResult[]) => resultsForCollection.map((result, idx) => this.makeResult(result, idx, isFetching));
    let style = (resultsForCollection: SelfTestsResult[]) => resultsForCollection.every(r => r.success) ? "success" : "danger";
    collectionList = Object.keys(sorted).map((collection, idx) => {
      let resultsForCollection = sorted[collection];
      return (
        <Panel
          id={`collection-${idx}`}
          key={collection}
          headerText={isInitial(collection) ? "Initial Setup" : collection}
          openByDefault={isInitial(collection)}
          content={content(resultsForCollection)}
          style={style(resultsForCollection)}
        />
      );
    });
    return collectionList;
  }

  async runSelfTests(e) {
    e.preventDefault();
    this.setState({
      runTests: true,
      error: null,
    });

    try {
      await this.props.runSelfTests();
      this.props.getSelfTests();
      this.setState({
        runTests: false,
        error: null,
      });
    } catch (error) {
      this.setState({
        runTests: false,
        error: error,
      });
    }
  }
}

function mapStateToProps(state, ownProps) {
  const selfTests = state.editor.selfTests;
  let item = ownProps.item;
  if (selfTests && selfTests.responseBody && selfTests.responseBody.self_test_results) {
    if (ownProps.type.includes(selfTests.responseBody.self_test_results.goal)) {
      let oldTime = item.self_test_results && item.self_test_results.start;
      let newTime = selfTests.responseBody.self_test_results.self_test_results && selfTests.responseBody.self_test_results.self_test_results.start;
      if ((!oldTime || (newTime > oldTime)) && selfTests.responseBody.self_test_results.id === item.id) {
        item = selfTests.responseBody.self_test_results;
      }
    }
  }
  return {
    isFetching: selfTests.isFetching,
    item: item
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  let fetcher = new DataFetcher();
  let actions = new ActionCreator(fetcher, ownProps.csrfToken);
  const integrationId = ownProps.item.id;
  const url = `/admin/${ownProps.type.replace(/ /g, "_")}_self_tests/${integrationId}`;

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
