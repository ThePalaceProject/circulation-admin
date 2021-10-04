import * as React from "react";
import EditableInput from "./EditableInput";

export interface SortButtonsProps {
  changeSort: () => void;
  sortOrder: "asc" | "desc";
}

export default function SortButtons({
  changeSort,
  sortOrder,
}: SortButtonsProps) {
  const sortOrders = ["asc", "desc"];
  return (
    <fieldset className="sort-options">
      <legend className="visuallyHidden">Select list sort type</legend>
      {sortOrders.map((order) => {
        const isChecked = sortOrder === order;
        return (
          <EditableInput
            key={order}
            type="radio"
            label={order === "asc" ? "Sort A-Z" : "Sort Z-A"}
            name="sort"
            onChange={changeSort}
            checked={isChecked}
            disabled={false}
          />
        );
      })}
    </fieldset>
  );
}
