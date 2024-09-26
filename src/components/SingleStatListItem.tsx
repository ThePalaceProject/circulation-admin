import * as React from "react";
import { formatNumber, roundedNumber } from "../utils/sharedFunctions";

export interface SingleStatListItemProps {
  label: string;
  value: number;
  tooltip?: string;
}

const SingleStatListItem = (props: SingleStatListItemProps) => {
  const baseStat = (
    <>
      <span className="stat-value">{roundedNumber(props.value)}</span>
      <span className="stat-label">{props.label}</span>
    </>
  );
  return (
    <li className="single-stat">
      {!props.tooltip ? (
        baseStat
      ) : (
        <span
          className="stat-tooltip"
          data-toggle="tooltip"
          title={`(${formatNumber(props.value)}) ${props.tooltip}`}
        >
          {baseStat}
        </span>
      )}
    </li>
  );
};

export default SingleStatListItem;
