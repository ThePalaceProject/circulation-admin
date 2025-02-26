import * as React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { AdvancedSearchQuery } from "../interfaces";
import AdvancedSearchFilterInput from "./AdvancedSearchFilterInput";
import AdvancedSearchFilterViewer from "./AdvancedSearchFilterViewer";

export interface AdvancedSearchBuilderProps {
  isOwner?: boolean;
  name: string;
  query: AdvancedSearchQuery;
  selectedQueryId: string;
  addQuery?: (builderName: string, query: AdvancedSearchQuery) => void;
  updateClearFiltersFlag?: (builderName: string, value: boolean) => void;
  updateQueryBoolean?: (builderName: string, id: string, bool: string) => void;
  moveQuery?: (builderName: string, id: string, targetId: string) => void;
  removeQuery?: (builderName: string, id: string) => void;
  selectQuery?: (builderName: string, id: string) => void;
}

const capitalizeEachWord = (str: string) =>
  str.replace(/(?:^|\s)\S/g, (word) => word.toUpperCase());

type FieldType = {
  value: string;
  label: string;
  helpText?: string;
  placeholder?: string;
  operators?: string[];
  options?: string[];
};

export const fields: FieldType[] = [
  { value: "data_source", label: "distributor" },
  { value: "publisher", label: "publisher" },
  {
    value: "published",
    label: "publication date",
    helpText: "Publication dates must be entered in the format YYYY-MM-DD.",
    placeholder: "YYYY-MM-DD",
  },
  { value: "genre", label: "genre" },
  { value: "language", label: "language" },
  { value: "classification", label: "subject" },
  { value: "audience", label: "audience" },
  { value: "author", label: "author" },
  { value: "title", label: "title" },
  {
    value: "fiction",
    label: "classification",
    options: ["fiction", "nonfiction"],
    operators: ["eq"],
  },
]
  .toSorted((a: FieldType, b: FieldType) => a.label.localeCompare(b.label))
  .map((props) => ({
    ...props,
    label: capitalizeEachWord(props.label),
  }));

export const operators = [
  { value: "eq", label: "equals", symbol: "=" },
  { value: "contains", label: "contains", symbol: ":" },
  { value: "regex", label: "matches regex", symbol: "~" },
  { value: "neq", label: "does not equal", symbol: "≠" },
  { value: "gt", label: "is greater than", symbol: ">" },
  { value: "gte", label: "is greater than or equals", symbol: "≥" },
  { value: "lt", label: "is less than", symbol: "<" },
  { value: "lte", label: "is less than or equals", symbol: "≤" },
].map((operator) => ({
  ...operator,
  label: capitalizeEachWord(operator.label),
}));

export default function AdvancedSearchBuilder({
  isOwner,
  name,
  query,
  selectedQueryId,
  addQuery,
  updateClearFiltersFlag,
  updateQueryBoolean,
  moveQuery,
  removeQuery,
  selectQuery,
}: AdvancedSearchBuilderProps) {
  const readOnly = !isOwner;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="advanced-search">
        {!readOnly && (
          <AdvancedSearchFilterInput
            name={name}
            onAdd={(query) => addQuery?.(name, query)}
            onClearFiltersFlagChange={(value) =>
              updateClearFiltersFlag?.(name, value)
            }
          />
        )}

        <AdvancedSearchFilterViewer
          query={query}
          readOnly={readOnly}
          selectedQueryId={selectedQueryId}
          onBooleanChange={(id, bool) => updateQueryBoolean?.(name, id, bool)}
          onMove={(id, targetId) => moveQuery?.(name, id, targetId)}
          onRemove={(id) => removeQuery?.(name, id)}
          onSelect={(id) => selectQuery?.(name, id)}
        />
      </div>
    </DndProvider>
  );
}
