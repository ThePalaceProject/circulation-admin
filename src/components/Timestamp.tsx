import * as React from "react";
import { TimestampData } from "../interfaces";
import { Panel } from "library-simplified-reusable-components";

export interface TimestampProps {
  timestamp: TimestampData;
}

export default class Timestamp extends React.Component<TimestampProps, {}> {
  render(): JSX.Element {
    const { timestamp } = this.props;
    const exception = (
      <section className="well exception">
        <pre>{timestamp.exception}</pre>
      </section>
    );
    const achievements = (
      <section className="well">
        <pre>{timestamp.achievements}</pre>
      </section>
    );

    const content = (
      <ul>
        <li>Duration: {timestamp.duration} seconds</li>
        {timestamp.achievements && <li>{achievements}</li>}
        {timestamp.exception && <li>{exception}</li>}
      </ul>
    );

    // If the timestamp has an exception, it should start out expanded.
    return (
      <Panel
        id={`timestamp-${timestamp.id}`}
        headerText={timestamp.start}
        style={timestamp.exception ? "danger" : "success"}
        content={content}
        collapsible={false}
      />
    );
  }
}
