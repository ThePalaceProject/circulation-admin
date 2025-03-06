import * as React from "react";
import { Button } from "library-simplified-reusable-components";
import { AdvancedSearchQuery } from "../interfaces";
import { fields, operators } from "./AdvancedSearchBuilder";
import EditableInput from "./EditableInput";

export interface AdvancedSearchFilterInputProps {
  name: string;
  onAdd: (query: AdvancedSearchQuery) => void;
  onClearFiltersFlagChange: (value: boolean) => void;
}

export default function AdvancedSearchFilterInput({
  name: builderName,
  onAdd,
  onClearFiltersFlagChange,
}: AdvancedSearchFilterInputProps) {
  const opSelect = React.useRef(null);
  const valueInput = React.useRef(null);
  const clearFiltersInput = React.useRef(null);

  const [filterKey, setFilterKey] = React.useState("genre");
  const [filterOp, setFilterOp] = React.useState("eq");
  const [filterValue, setFilterValue] = React.useState("");

  const handleKeyChange = (value) => {
    setFilterKey(value);
    const selected = fields.find((field) => field.value === value);

    // Set the value to either the first option, or blank.
    if (selected.options && selected.options.length) {
      setFilterValue(selected.options[0]);
    } else {
      setFilterValue("");
    }

    // Update operator if the filter doesn't support it.
    if (
      selected.operators &&
      selected.operators.length &&
      !selected.operators.find((op) => op === filterOp)
    ) {
      setFilterOp(selected.operators[0]);
    }
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

  const updateClearFiltersFlag = (checked: boolean) => {
    onClearFiltersFlagChange(checked);
  };

  const handleInputChange = () => {
    updateClearFiltersFlag(clearFiltersInput.current?.getChecked());
  };

  const selectedField = fields.find((field) => field.value === filterKey);
  const selectedFieldOperators = selectedField.operators
    ? operators.filter((op) => selectedField.operators.includes(op.value))
    : operators;

  const selectedFieldOptions = selectedField.options ?? [];
  const selectedFieldElementType = selectedFieldOptions.length
    ? "select"
    : "input";

  return (
    <form className="advanced-search-filter-input">
      <span>Add filter on:</span>
      <div className="filter-key-op-value-inputs">
        <EditableInput
          aria-label="filter field key"
          elementType="select"
          onBlur={handleKeyChange}
          onChange={handleKeyChange}
          value={filterKey}
          className="filter-key"
        >
          {fields.map(({ value, label }) => (
            <option
              aria-selected={value === filterKey}
              key={value}
              value={value}
            >
              {label}
            </option>
          ))}
        </EditableInput>

        <EditableInput
          aria-label="filter operator"
          elementType="select"
          onBlur={handleOpChange}
          onChange={handleOpChange}
          ref={opSelect}
          value={filterOp}
          className="filter-operator"
        >
          {selectedFieldOperators.map(({ value, label }) => (
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
          aria-label="filter value"
          description={selectedField?.helpText}
          elementType={selectedFieldElementType}
          type="text"
          optionalText={false}
          placeholder={selectedField?.placeholder || "Enter Search Term"}
          ref={valueInput}
          value={filterValue}
          onChange={handleValueChange}
          className="filter-value"
        >
          {selectedFieldOptions.length === 0
            ? null
            : selectedFieldOptions.map((value) => (
                <option
                  key={value}
                  value={value}
                  aria-selected={value === filterValue}
                >
                  {value}
                </option>
              ))}
        </EditableInput>

        <div className="filter-submit">
          <Button
            className="inverted inline"
            callback={handleAddClick}
            content="Add filter"
            disabled={!(filterKey && filterOp && filterValue.trim())}
            type="submit"
          />
          <EditableInput
            type="checkbox"
            name={`clear-filters-on-search-${builderName}`}
            ref={clearFiltersInput}
            onChange={handleInputChange}
            label="Clear filters on search"
          />
        </div>
      </div>
    </form>
  );
}
