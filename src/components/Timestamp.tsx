import * as React from "react";
import { TimestampData } from "../interfaces";
import Collapsible from "./Collapsible";

export interface TimestampProps {
  timestamp: TimestampData;
}

export default class Timestamp extends React.Component<TimestampProps, void> {
  render(): JSX.Element {
    let exception = <li><section className="well">{this.props.timestamp.exception}</section></li>;
    let achievements = <li>{JSON.stringify(this.props.timestamp.achievements)}</li>;

    let body = (
      <ul>
        <li>Duration: {this.props.timestamp.duration} seconds</li>
        {
          this.props.timestamp.achievements && achievements
        }
        {
          this.props.timestamp.exception && exception
        }
      </ul>
    );

    return (
      <Collapsible
        title={this.props.timestamp.start}
        style={this.props.timestamp.exception ? "danger" : "success"}
        body={body}
        openByDefault={!!this.props.timestamp.exception}
      />
    );
  }
}
