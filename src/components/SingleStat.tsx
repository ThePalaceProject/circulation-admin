import * as React from "react";
import * as numeral from "numeral";
import { formatNumber } from "./LibraryStats";

export interface SingleStatProps {
  label: string;
  value: number;
  tooltip?: string;
}

const humanNumber = (n: number): string =>
  n ? numeral(n).format("0.[0]a") : "0";

const SingleStat = (props: SingleStatProps) => {
  const baseStat = (
    <li className="single-stat">
      <span className="stat-value">{humanNumber(props.value)}</span>
      <span className="stat-label">{props.label}</span>
    </li>
  );
  return !props.tooltip ? (
    baseStat
  ) : (
    <span
      data-toggle="tooltip"
      title={`(${formatNumber(props.value)}) ${props.tooltip}`}
    >
      {baseStat}
    </span>
  );
};

export default SingleStat;
