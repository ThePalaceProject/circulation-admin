import React = require("react");
import StatsGroup from "./StatsGroup";
import SingleStatListItem from "./SingleStatListItem";

type Props = {
  heading?: string;
  description?: string;
  loans: number;
  holds: number;
};

const StatsTotalCirculationsGroup = ({
  heading = "Circulation",
  description = "Real-time total circulation information of the Palace System.",
  loans,
  holds,
}: Props) => {
  return (
    <StatsGroup heading={heading} description={description}>
      <ul>
        <SingleStatListItem
          label="Active Loans"
          value={loans}
          tooltip="Total number of active loans for all patrons."
        />
        <SingleStatListItem
          label="Active Holds"
          tooltip="Total number of active holds for all patrons."
          value={holds}
        />
      </ul>
    </StatsGroup>
  );
};

export default StatsTotalCirculationsGroup;
