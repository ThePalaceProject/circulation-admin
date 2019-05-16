import * as React from "react";
import { Button } from "library-simplified-reusable-components";
import AddIcon from "./icons/AddIcon";
import PencilIcon from "./icons/PencilIcon";
import ResetIcon from "./icons/ResetIcon";
import VisibleIcon from "./icons/VisibleIcon";
import HiddenIcon from "./icons/HiddenIcon";
import XCloseIcon from "./icons/XCloseIcon";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Link } from "react-router";
import { LaneData } from "../interfaces";
import Lane from "./Lane";

export interface LanesSidebarProps {
  orderChanged: boolean;
  library?: string;
  drag: (newState: {
    "draggableId"?: string,
    "draggingFrom"?: string,
    "lanes"?: LaneData[],
    "orderChanged"?: boolean
  }) => void;
  lanes: LaneData[] | null;
  findLaneForIdentifier?: (lanes: LaneData[], identifier: string) => LaneData | null;
  findParentOfLane?: (lane: LaneData, lanes?: LaneData[]) => LaneData;
  identifier?: string;
  toggleLaneVisibility?: (lane: LaneData, shouldBeVisible: boolean) => Promise<void>;
}

export default class LanesSidebar extends React.Component<LanesSidebarProps, {}> {
  constructor(props: LanesSidebarProps) {
    super(props);
    this.renderLink = this.renderLink.bind(this);
    this.isDropDisabled = this.isDropDisabled.bind(this);
    this.renderLanes = this.renderLanes.bind(this);
    this.renderLane = this.renderLane.bind(this);
    this.onDragStart = this.onDragStart.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
  }

  render(): JSX.Element {
    let linkBase = "/admin/web/lanes/" + this.props.library;
    return (<div className="lanes-sidebar">
      <h2>Lane Manager</h2>
      <div>
        { this.renderLink("create") }
        { this.renderLink("reset") }
      </div>
      {
        this.props.lanes &&
        <DragDropContext onDragStart={this.onDragStart} onDragEnd={this.onDragEnd}>
        { this.renderLanes(this.props.lanes, null) }
        </DragDropContext>
      }
    </div>);
  }

  renderLink(createOrReset: string): JSX.Element {
    let linkBase = `/admin/web/lanes/${this.props.library}/`;
    let content = {
      "create": ["Create Top-Level Lane", <AddIcon />, null],
      "reset": ["Reset All Lanes", <ResetIcon />, "inverted"]
    };
    let [text, icon, className] = content[createOrReset];
    let disabled = this.props.orderChanged ? "disabled" : "";
    return (
      <Link
        className={`btn ${createOrReset}-lane ${disabled} ${className}`}
        to={this.props.orderChanged ? null : linkBase + createOrReset}
      >
        <span>{text} {icon}</span>
      </Link>
    );
  }

  renderLanes(lanes: LaneData[], parent: LaneData | null): JSX.Element {
    const draggingLane = this.props.findLaneForIdentifier(null, null);
    const disabled = this.isDropDisabled(draggingLane, parent);

    if (lanes.length > 1) {
      return (
        <Droppable
          droppableId={parent ? String(parent.id) : "top"}
          isDropDisabled={disabled}
        >
          {(provided, snapshot) => (
            <ul
              ref={provided.innerRef}
              className={(snapshot.isDraggingOver && !disabled) ? "droppable dragging-over" : "droppable"}
            >
              { lanes.map(lane =>
                  <Draggable draggableId={String(lane.id)} key={lane.id}>
                    { (provided, snapshot) => this.renderLane(lane, parent, provided, snapshot) }
                  </Draggable>
              )}
              { provided.placeholder }
            </ul>
          )}
        </Droppable>
      );
    }
    if (lanes.length === 1) {
      return (
        <ul>
          { this.renderLane(lanes[0], parent) }
        </ul>
      );
    }
    return null;
  }

  renderLane(lane: LaneData, parent: LaneData | null, provided?, snapshot?): JSX.Element {
    return (
      <Lane
        lane={lane}
        active={String(lane.id) === this.props.identifier}
        snapshot={snapshot}
        provided={provided}
        orderChanged={this.props.orderChanged}
        toggleLaneVisibility={this.props.toggleLaneVisibility}
        parent={parent}
        library={this.props.library}
        renderLanes={this.renderLanes}
      />
    );
  }

  onDragStart(initial) {
    document.body.classList.add("dragging");
    const draggableId = initial.draggableId;
    const draggingFrom = initial.source.droppableId;
    this.props.drag({ draggableId, draggingFrom });
  }

  onDragEnd(result) {
    document.body.classList.remove("dragging");
    const {
      draggableId,
      destination,
      source
    } = result;

    if (!destination || !source || (destination.droppableId !== source.droppableId)) {
      return;
    }

    const oldIndex = source.index;
    const newIndex = destination.index;

    if (oldIndex === newIndex) {
      // The lane was dropped back to its original position.
      return;
    }

    let lanes = this.props.lanes;
    const draggedLane = this.props.findLaneForIdentifier(lanes, draggableId);
    const parent = this.props.findParentOfLane(draggedLane, lanes);
    // If the lane has a parent, we'll update its position within its parents'
    // sublanes. Otherwise, we'll update its position at the top-level.
    let lanesToUpdate;
    if (parent) {
      lanesToUpdate = parent.sublanes;
    } else {
      lanesToUpdate = lanes;
    }

    // Remove the lane from its old position.
    lanesToUpdate = lanesToUpdate.slice(0, oldIndex).concat(lanesToUpdate.slice(oldIndex + 1, lanesToUpdate.length));
    // Put it back in its new position.
    lanesToUpdate.splice(newIndex, 0, draggedLane);

    // Actually update the lanes.
    if (parent) {
      parent.sublanes = lanesToUpdate;
    } else {
      lanes = lanesToUpdate;
    }

    this.props.drag({ draggableId: null, draggingFrom: null, lanes, orderChanged: true });
  }

  isDropDisabled(draggingLane: LaneData | null, toLane: LaneData | null) {
    if (!draggingLane) {
      return false;
    }

    // You can only drag a lane within its parent. It would be nice
    // to change the parent by dragging, but it's difficult because
    // dragging a child can cause the parent to move and mess up
    // the positioning of the dragging child.

    const draggingParent = this.props.findParentOfLane(draggingLane);
    if (draggingParent && toLane === null) {
      return true;
    }
    if (!draggingParent && toLane !== null) {
      return true;
    }
    if (draggingParent && toLane && (draggingParent.id !== toLane.id)) {
      return true;
    }
    return false;
  }
}
