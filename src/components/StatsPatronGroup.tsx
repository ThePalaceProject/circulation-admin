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
              Total number of patron records currently cached in the Palace System.

              Please note: This value does not necessarily reflect direct patron
              interaction with the Palace applications. Use of external discovery
              systems that interact with Palace on a patron's behalf may inflate
              this number.
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
