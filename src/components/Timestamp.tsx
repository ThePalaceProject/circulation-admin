import * as React from "react";
import { TimestampData } from "../interfaces";
import { Panel } from "library-simplified-reusable-components";

export interface TimestampProps {
  timestamp: TimestampData;
}

export default class Timestamp extends React.Component<TimestampProps, void> {
  render(): JSX.Element {
    let exception = <section className="well exception"><pre>{this.props.timestamp.exception}</pre></section>;
    let achievements = <section className="well"><pre>{this.props.timestamp.achievements}</pre></section>;

    let body = (
      <ul>
        <li>Duration: {this.props.timestamp.duration} seconds</li>
        {
          this.props.timestamp.achievements &&
          <li>{achievements}</li>
        }
        {
          this.props.timestamp.exception &&
          <li>{exception}</li>
        }
      </ul>
    );

    // If the timestamp has an exception, it should start out expanded.
    return (
      <Panel
        headerText={this.props.timestamp.start}
        style={this.props.timestamp.exception ? "danger" : "success"}
        body={body}
        collapsible={false}
      />
    );
  }
}
