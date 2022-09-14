import * as React from "react";
import classNames from "classnames";
import {
  ConnectDragPreview,
  ConnectDragSource,
  ConnectDropTarget,
  useDrag,
  useDrop,
} from "react-dnd";
import { AdvancedSearchQuery } from "../interfaces";
import { fields, operators } from "./AdvancedSearchBuilder";

export interface AdvancedSearchValueFilterProps {
  query: AdvancedSearchQuery;
  readOnly?: boolean;
  selected?: boolean;
  onMove: (id: string, targetId: string) => void;
  onRemove: (id: string) => void;
  onSelect: (id: string) => void;
}

function getFieldLabel(value) {
  const field = fields.find((field) => field.value === value);

  return field?.label || value;
}

function getOpSymbol(value) {
  const op = operators.find((op) => op.value === value);

  return op?.symbol || value;
}

export default ({
  query,
  readOnly,
  selected,
  onMove,
  onRemove,
  onSelect,
}: AdvancedSearchValueFilterProps) => {
  if (!query) {
    return null;
  }

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

  const [, drag]: [{}, ConnectDragSource, ConnectDragPreview] = useDrag(
    {
      type: "filter",
      item: {
        id: query.id,
      },
    },
    [query.id]
  );

  const [dropProps, drop]: [
    { canDrop: boolean; isOver: boolean },
    ConnectDropTarget
  ] = useDrop(
    {
      accept: "filter",
      canDrop: (item: any) => item.id !== query.id,
      drop: (item: any, monitor) => {
        if (!monitor.didDrop()) {
          onMove?.(item.id, query.id);

          return {
            id: query.id,
          };
        }
      },
      collect: (monitor) => ({
        canDrop: !!monitor.canDrop(),
        isOver: !!monitor.isOver(),
      }),
    },
    [query.id, onMove]
  );

  const isSelected = !readOnly && selected;
  const { key, op, value } = query;

  const className = classNames({
    "advanced-search-value-filter": true,
    "drag-drop": dropProps.isOver && dropProps.canDrop,
    selected: isSelected,
  });

  return (
    <div
      aria-selected={isSelected}
      className={className}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      ref={readOnly ? undefined : (node) => drag(drop(node))}
      role="treeitem"
      tabIndex={0}
    >
      <span>
        {getFieldLabel(key)} {getOpSymbol(op)} {value}
      </span>

      {!readOnly && <button onClick={handleRemoveButtonClick}>×</button>}
    </div>
  );
};
