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
    setFilterValue("");
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
  const selectedFieldOperators =
    selectedField.operators !== undefined
      ? operators.filter((element) => {
          return selectedField.operators.includes(element.value);
        })
      : operators;

  const selectedFieldOptions = selectedField.options ?? [];
  const selectedFieldElementType = selectedFieldOptions.length
    ? "input"
    : "select";
  if (selectedFieldOptions.length !== 0) {
    if (
      !selectedFieldOptions.find((element) => {
        return element === filterValue;
      })
    ) {
      setFilterValue(selectedFieldOptions[0]);
    }
  }

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
          description={selectedField.helpText}
          elementType={selectedFieldElementType}
          type="text"
          optionalText={false}
          placeholder={selectedField.placeholder}
          ref={valueInput}
          value={filterValue}
          onChange={handleValueChange}
          className="filter-value"
        >
          {selectedFieldOptions.length === 0
            ? null
            : selectedFieldOptions.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
        </EditableInput>

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
    </form>
  );
}
