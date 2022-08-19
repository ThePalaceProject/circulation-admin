import * as React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { AdvancedSearchQuery } from "../interfaces";
import AdvancedSearchFilterInput from "./AdvancedSearchFilterInput";
import AdvancedSearchFilterViewer from "./AdvancedSearchFilterViewer";

export interface AdvancedSearchBuilderProps {
  name: string;
  query: AdvancedSearchQuery;
  selectedQueryId: string;
  addQuery?: (builderName: string, query: AdvancedSearchQuery) => void;
  updateQueryBoolean?: (builderName: string, id: string, bool: string) => void;
  moveQuery?: (builderName: string, id: string, targetId: string) => void;
  removeQuery?: (builderName: string, id: string) => void;
  selectQuery?: (builderName: string, id: string) => void;
}

export const fields = [
  { value: "data_source", label: "distributor" },
  { value: "publisher", label: "publisher" },
  { value: "published", label: "publication date" },
  { value: "genre", label: "genre" },
  { value: "language", label: "language" },
  { value: "classification", label: "subject" },
  { value: "audience", label: "audience" },
  { value: "author", label: "author" },
  { value: "title", label: "title" },
];

export const operators = [
  { value: "eq", label: "equals", symbol: "=" },
  { value: "contains", label: "contains", symbol: ":" },
  { value: "regex", label: "matches regex", symbol: "~" },
  { value: "neq", label: "does not equal", symbol: "≠" },
  { value: "gt", label: "is greater than", symbol: ">" },
  { value: "gte", label: "is greater than or equals", symbol: "≥" },
  { value: "lt", label: "is less than", symbol: "<" },
  { value: "lte", label: "is less than or equals", symbol: "≤" },
];

export default function AdvancedSearchBuilder({
  name,
  query,
  selectedQueryId,
  addQuery,
  updateQueryBoolean,
  moveQuery,
  removeQuery,
  selectQuery,
}: AdvancedSearchBuilderProps) {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="advanced-search">
        <AdvancedSearchFilterInput
          name={name}
          onAdd={(query) => addQuery?.(name, query)}
        />

        <AdvancedSearchFilterViewer
          query={query}
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
