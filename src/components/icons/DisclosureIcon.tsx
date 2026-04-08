import * as React from "react";

interface DisclosureIconProps {
  expanded: boolean;
}

const DisclosureIcon = ({ expanded }: DisclosureIconProps): JSX.Element => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 12 12"
    aria-hidden="true"
    className={`disclosure-icon${expanded ? " expanded" : ""}`}
  >
    <polygon points="2,1 10,6 2,11" fill="currentColor" />
  </svg>
);

export default DisclosureIcon;
