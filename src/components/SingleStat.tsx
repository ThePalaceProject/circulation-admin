import * as React from "react";
import ToolTip from "./ToolTip";

export interface SingleStatProps {
    label: string;
    value: string;
    tooltip?: string;
}

export default class SingleStat extends React.Component<SingleStatProps, {}> {
  render(): JSX.Element {
    let baseStat = (
      <li className="single-stat">
        <span className="stat-value">{this.props.value}</span>
        <span className="stat-label">{this.props.label}</span>
      </li>
    )
    return baseStat
  }
}
