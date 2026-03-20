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
      <div className="stat-group-header">
        <h3>
          <span className="stat-grouping-label">{heading}</span>
        </h3>
        {headingAdditionalContent && (
          <div className="stat-group-heading-actions">
            {headingAdditionalContent}
          </div>
        )}
      </div>
      <div className="stat-group-description">{description}</div>
    </div>
    {children}
  </>
);

export default StatsGroup;
