import React = require("react");
import StatsGroup from "./StatsGroup";
import SingleStatListItem from "./SingleStatListItem";

type Props = {
  heading?: string;
  description?: string;
  total?: number;
  withActiveLoan: number;
  withActiveLoanOrHold: number;
};

const StatsPatronGroup = ({
  heading = "Patrons",
  description = "Real-time patron information for the Palace System.",
  total = undefined,
  withActiveLoan,
  withActiveLoanOrHold,
}: Props) => {
  return (
    <StatsGroup heading={heading} description={description}>
      <ul>
        {total && (
          <SingleStatListItem
            label="Total Patrons"
            value={total}
            tooltip={`
              Total number of patrons in the Palace System.
              Please note:
              this number could be artificially inflated if you have an
              Aspen integration. We are working to address the issue and
              will update you when it’s resolved.
              `
              .replace(/(?:\s|\r\n|\r|\n)+/g, " ")
              .trim()}
          />
        )}
        <SingleStatListItem
          label="Patrons With Active Loans"
          value={withActiveLoan}
          tooltip="Number of patrons with at least one active loan."
        />
        <SingleStatListItem
          label="Patrons With Active Loans or Holds"
          value={withActiveLoanOrHold}
          tooltip="Number of patrons with at least one active loan or at least one hold."
        />
      </ul>
    </StatsGroup>
  );
};

export default StatsPatronGroup;
