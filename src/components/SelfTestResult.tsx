import * as React from "react";
import { Panel } from "library-simplified-reusable-components";
import { SelfTestsResult } from "../interfaces";

export interface SelfTestResultProps {
  result: SelfTestsResult;
  isFetching: boolean;
}

export default class SelfTestResult extends React.Component<SelfTestResultProps, {}> {
  constructor(props) {
    super(props);
    this.renderResult = this.renderResult.bind(this);
    this.renderCollapsible = this.renderCollapsible.bind(this);
  }

  render() {
    const colorResultClass = this.props.result.success ? "success" : "failure";
    return (
      <li className={this.props.isFetching ? "loading-self-test" : colorResultClass} key={this.props.result.name}>
        <h4>{this.props.result.name}</h4>
        {
          this.props.result.success && this.props.result.result && !this.props.result.result.length ?
          <span className="warning">The test ran successfully, but no results were found.</span>
          : null
        }
        {
          this.props.result.result && this.props.result.result.length ?
            this.renderResult(this.props.result.result, colorResultClass)
            : null
        }
        <p className="success-description">
          success: {`${this.props.result.success}`}
        </p>
        {
          !this.props.result.success && (
            <p className="exception-description">
              exception: {this.props.result.exception.message}
            </p>
          )
        }
      </li>
    );
  }

  renderResult(result, colorResultClass) {
    let isList = Array.isArray(result);

    let content = isList ?
      <ol>{result.map((item, idx) => <li key={idx}>{item}</li>)}</ol> :
      result;

    let body = <pre className="result-description">{content}</pre>;

    // If the result is a list, or is more than one line long, display it in a collapsible panel. (So far, the most likely
    // way to have a multi-line result is if it's from a search service test that returns a prettified JSON object,
    // but future tests might return normal strings which happen to be very long.)

    let collapsible = (isList || result.split("\n").length > 1);
    return (collapsible && this.renderCollapsible(result, body, colorResultClass, isList)) || body;
  }

  renderCollapsible(result, body, colorResultClass, isList) {
    let title = isList ? `Results (${result.length})` : "Results";

    return <Panel
      headerText={title}
      content={body}
      style={colorResultClass}
    />;
  }
}
