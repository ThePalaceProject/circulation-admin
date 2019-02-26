import * as React from "react";
import Collapsible from "./Collapsible";
import { SelfTestsResult } from "../interfaces";

export interface SelfTestResultProps {
  result: SelfTestsResult;
  isFetching: boolean;
}

export default class SelfTestResult extends React.Component<SelfTestResultProps, void> {
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
    let list = Array.isArray(result);

    let content = list ?
      <ol>{result.map((item, idx) => <li key={idx}>{item}</li>)}</ol> :
      result;

    let body = <pre className="result-description">{content}</pre>;

    // If the result is a list, or is more than one line long (in which case it's probably a stringified JSON object),
    // display it in a collapsible panel.
    let collapsible = (list || result.split("\n").length > 1);
    return (collapsible && this.renderCollapsible(result, body, colorResultClass, list)) || body;
  }

  renderCollapsible(result, body, colorResultClass, list) {
    let title = list ? `Results (${result.length})` : "Results";

    return <Collapsible
      title={title}
      body={body}
      style={colorResultClass}
    />;
  }
}
