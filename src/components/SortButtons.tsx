import * as React from "react";
import EditableInput from "./EditableInput";
export interface SortButtonsProps {
  changeSort: () => void;
  isSortedAtoZ: boolean;
}

export default function SortButtons({
  changeSort,
  isSortedAtoZ,
}: SortButtonsProps) {
  const sortOrders = ["asc", "desc"];
  return (
    <fieldset className="sort-options">
      <legend className="visuallyHidden">Select list sort type</legend>
      {sortOrders.map((order) => {
        return (
          <EditableInput
            key={order}
            type="radio"
            label={order === "asc" ? "Sort A-Z" : "Sort Z-A"}
            name="sort"
            onChange={changeSort}
            checked={isSortedAtoZ ? order === "asc" : order === "desc"}
            disabled={false}
          />
        );
      })}
    </fieldset>
  );
}
