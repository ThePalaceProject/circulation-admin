import * as React from "react";
import * as numeral from "numeral";

export interface SingleStatProps {
    label: string;
    value: number;
    tooltip?: string;
}

export default class SingleStat extends React.Component<SingleStatProps, {}> {
  render(): JSX.Element {
    let baseStat = (
      <li className="single-stat">
        <span className="stat-value">{this.humanNumber(this.props.value)}</span>
        <span className="stat-label">{this.props.label}</span>
      </li>
    );
    return !this.props.tooltip ?
        baseStat : (
            <span tabIndex={0} data-toggle="tooltip"
                  title={`(${this.formatNumber(this.props.value)}) ${this.props.tooltip}`}
            >
                {baseStat}
            </span>
        );
  }

  humanNumber(n: number): string {
    return n ? numeral(n).format("0.[0]a") : "0";
  }

  formatNumber(n: number): string {
    return Intl.NumberFormat("en-US").format(n);
  }
}
