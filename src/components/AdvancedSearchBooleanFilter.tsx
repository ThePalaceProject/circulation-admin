import classNames from "classnames";
import * as React from "react";
import { ConnectDropTarget, useDrop } from "react-dnd";
import { AdvancedSearchQuery } from "../interfaces";
import AdvancedSearchFilter from "./AdvancedSearchFilter";

export interface AdvancedSearchBooleanFilterProps {
  query: AdvancedSearchQuery;
  selectedQueryId?: string;
  onBooleanChange: (id: string, bool: string) => void;
  onMove: (id: string, targetId: string) => void;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
}

const renderSeparator = (query, index) => {
  if (index < 1) {
    return null;
  }

  return <span>{query.and ? "and" : "or"}</span>;
};

export default function AdvancedSearchBooleanFilter({
  query,
  selectedQueryId,
  onBooleanChange,
  onMove,
  onSelect,
  onRemove,
}: AdvancedSearchBooleanFilterProps) {
  const children = query && (query.and || query.or);

  if (!children) {
    return null;
  }

  const handleBooleanChange = (
    event: React.SyntheticEvent<HTMLSelectElement>
  ) => {
    const bool = event.currentTarget.value;

    if (!query[bool]) {
      onBooleanChange?.(query.id, event.currentTarget.value);
    }
  };

  const handleClick = (event: React.SyntheticEvent) => {
    event.stopPropagation();
    event.preventDefault();

    onSelect?.(query.id);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    event.stopPropagation();
    event.preventDefault();

    if (event.key === " ") {
      onSelect?.(query.id);
    }
  };

  const handleRemoveButtonClick = (event: React.SyntheticEvent) => {
    event.stopPropagation();
    event.preventDefault();

    onRemove?.(query.id);
  };

  const [dropProps, drop]: [
    { canDrop: boolean; isOver: boolean },
    ConnectDropTarget
  ] = useDrop(
    {
      accept: "filter",
      canDrop: (item: any) => item.id !== query.id,
      drop: (item: any, monitor) => {
        if (!monitor.didDrop()) {
          onMove(item.id, query.id);

          return {
            id: query.id,
          };
        }
      },
      collect: (monitor) => ({
        canDrop: !!monitor.canDrop(),
        isOver: !!monitor.isOver({ shallow: true }),
      }),
    },
    [query.id, onMove]
  );

  const className = classNames({
    "advanced-search-boolean-filter": true,
    "drag-drop": dropProps.isOver && dropProps.canDrop,
    selected: selectedQueryId === query.id,
  });

  return (
    <div
      aria-selected={selectedQueryId === query.id}
      className={className}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      ref={drop}
      role="treeitem"
      tabIndex={0}
    >
      <header>
        <div>
          <select
            onBlur={handleBooleanChange}
            onChange={handleBooleanChange}
            value={query.and ? "and" : "or"}
          >
            <option aria-selected={!!query.and} value="and">
              All of these filters must be matched:
            </option>
            <option aria-selected={!!query.or} value="or">
              Any of these filters may be matched:
            </option>
          </select>
        </div>

        <button onClick={handleRemoveButtonClick}>×</button>
      </header>

      <ul>
        {children.map((child, index) => (
          <li key={child.id}>
            {renderSeparator(query, index)}{" "}
            <AdvancedSearchFilter
              query={child}
              selectedQueryId={selectedQueryId}
              onBooleanChange={onBooleanChange}
              onMove={onMove}
              onSelect={onSelect}
              onRemove={onRemove}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
