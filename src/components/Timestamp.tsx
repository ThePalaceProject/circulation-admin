import * as React from "react";
import { TimestampData } from "../interfaces";
import Collapsible from "./Collapsible";

export interface TimestampProps {
  timestamp: TimestampData;
}

export default class Timestamp extends React.Component<TimestampProps, void> {
  render(): JSX.Element {
    let body = (
      <dl>
        {
          this.props.timestamp.achievements &&
          <dt>Achievements</dt> &&
          <dd>{JSON.stringify(this.props.timestamp.achievements)}</dd>
        }
        <dt>Duration</dt>
        <dd>{this.props.timestamp.duration} seconds</dd>
        {
          this.props.timestamp.exception &&
          <dt>Exception</dt> &&
          <dd>{this.props.timestamp.exception}</dd>
        }
      </dl>
    );
    return (
      <Collapsible
        title={this.props.timestamp.start}
        body={body}
        openByDefault={true}
        collapsible={false}
      />
    );
  }
}
