import * as React from "react";
import { AdvancedSearchQuery } from "../interfaces";
import AdvancedSearchFilter from "./AdvancedSearchFilter";

export interface AdvancedSearchFilterViewerProps {
  query: AdvancedSearchQuery;
  selectedQueryId?: string;
  onBooleanChange: (id: string, bool: string) => void;
  onMove: (id: string, targetId: string) => void;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
}

export default function AdvancedSearchFilterViewer({
  query,
  selectedQueryId,
  onBooleanChange,
  onMove,
  onSelect,
  onRemove,
}: AdvancedSearchFilterViewerProps): JSX.Element {
  return (
    <div className="advanced-search-filter-tree" role="tree">
      <AdvancedSearchFilter
        query={query}
        selectedQueryId={selectedQueryId}
        onBooleanChange={onBooleanChange}
        onMove={onMove}
        onRemove={onRemove}
        onSelect={onSelect}
      />
    </div>
  );
}
