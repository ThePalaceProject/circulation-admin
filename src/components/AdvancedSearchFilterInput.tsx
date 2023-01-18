import * as React from "react";
import { Button } from "library-simplified-reusable-components";
import { AdvancedSearchQuery } from "../interfaces";
import { fields, operators } from "./AdvancedSearchBuilder";
import EditableInput from "./EditableInput";

export interface AdvancedSearchFilterInputProps {
  name: string;
  onAdd: (query: AdvancedSearchQuery) => void;
}

export default function AdvancedSearchFilterInput({
  name: builderName,
  onAdd,
}: AdvancedSearchFilterInputProps) {
  const opSelect = React.useRef(null);
  const valueInput = React.useRef(null);

  const [filterKey, setFilterKey] = React.useState("genre");
  const [filterOp, setFilterOp] = React.useState("eq");
  const [filterValue, setFilterValue] = React.useState("");

  const handleKeyChange = (value) => {
    setFilterKey(value);
  };

  const handleOpChange = () => {
    setFilterOp(opSelect.current?.getValue());
  };

  const handleValueChange = () => {
    setFilterValue(valueInput.current?.getValue());
  };

  const addFilter = () => {
    const filterValueTrimmed = filterValue.trim();

    if (filterKey && filterOp && filterValueTrimmed) {
      onAdd?.({
        key: filterKey,
        op: filterOp,
        value: filterValueTrimmed,
      });

      setFilterValue("");
    }
  };

  const handleAddClick = (event: React.SyntheticEvent) => {
    event.stopPropagation();
    event.preventDefault();

    addFilter();
  };

  const selectedField = fields.find((field) => field.value === filterKey);

  return (
    <form className="advanced-search-filter-input">
      Add filter on:
      <div className="filter-key-options">
        {fields.map(({ value, label }) => (
          <EditableInput
            key={value}
            type="radio"
            name={`${builderName}-filter-key`}
            checked={value === filterKey ? true : false}
            label={label}
            value={value}
            onChange={handleKeyChange}
          />
        ))}
      </div>
      <div className="filter-op-value-inputs">
        <EditableInput
          elementType="select"
          onBlur={handleOpChange}
          onChange={handleOpChange}
          ref={opSelect}
          value={filterOp}
        >
          {operators.map(({ value, label }) => (
            <option
              aria-selected={value === filterOp}
              key={value}
              value={value}
            >
              {label}
            </option>
          ))}
        </EditableInput>

        <EditableInput
          description={selectedField.helpText}
          elementType="input"
          type="text"
          optionalText={false}
          placeholder={selectedField.placeholder}
          ref={valueInput}
          value={filterValue}
          onChange={handleValueChange}
        />

        <Button
          className="inverted inline"
          callback={handleAddClick}
          content="Add filter"
          disabled={!(filterKey && filterOp && filterValue.trim())}
          type="submit"
        />
      </div>
    </form>
  );
}
