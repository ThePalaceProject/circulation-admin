import * as React from "react";
import { AdvancedSearchQuery } from "../interfaces";
import AdvancedSearchBooleanFilter from "./AdvancedSearchBooleanFilter";
import AdvancedSearchValueFilter from "./AdvancedSearchValueFilter";

export interface AdvancedSearchFilterProps {
  onBooleanChange: (id: string, bool: string) => void;
  onMove: (id: string, targetId: string) => void;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  query: AdvancedSearchQuery;
  selectedQueryId?: string;
}

export default function AdvancedSearchFilter({
  query,
  selectedQueryId,
  onBooleanChange,
  onMove,
  onSelect,
  onRemove,
}: AdvancedSearchFilterProps): JSX.Element {
  if (query) {
    if (query.and || query.or) {
      return (
        <AdvancedSearchBooleanFilter
          query={query}
          selectedQueryId={selectedQueryId}
          onBooleanChange={onBooleanChange}
          onMove={onMove}
          onSelect={onSelect}
          onRemove={onRemove}
        />
      );
    }

    return (
      <AdvancedSearchValueFilter
        query={query}
        selected={query.id === selectedQueryId}
        onMove={onMove}
        onSelect={onSelect}
        onRemove={onRemove}
      />
    );
  }

  return <span>No filters configured.</span>;
}
