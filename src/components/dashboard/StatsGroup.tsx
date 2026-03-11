import * as React from "react";

type Props = {
  heading: string;
  headingAdditionalContent?: React.ReactNode | null;
  description: string;
  children: React.ReactNode;
};

const StatsGroup = ({
  heading,
  headingAdditionalContent = null,
  description,
  children,
}: Props) => (
  <>
    <div>
      <h3>
        <span className="stat-grouping-label">{heading}</span>
        {headingAdditionalContent}
      </h3>
      <div className="stat-group-description">{description}</div>
    </div>
    {children}
  </>
);

export default StatsGroup;
