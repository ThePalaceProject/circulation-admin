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
  onDragStart: (initial: any) => void;
  onDragEnd: (initial: any) => void;
  lanes: LaneData[] | null;
  laneForID?: any;
  findParent?: any;
  identifier?: any;
  toggleLaneVisibility?: (lane: LaneData, shouldBeVisible: boolean) => Promise<void>;
}

export default class LanesSidebar extends React.Component<LanesSidebarProps, {}> {
  constructor(props: LanesSidebarProps) {
    super(props);
    this.renderButton = this.renderButton.bind(this);
    this.isDropDisabled = this.isDropDisabled.bind(this);
    this.renderLanes = this.renderLanes.bind(this);
    this.renderLane = this.renderLane.bind(this);
  }

  render(): JSX.Element {
    let linkBase = "/admin/web/lanes/" + this.props.library;
    return (<div className="lanes-sidebar">
      <h2>Lane Manager</h2>
      <div>
        { this.renderButton("create") }
        { this.renderButton("reset") }
      </div>
      <DragDropContext onDragStart={this.props.onDragStart} onDragEnd={this.props.onDragEnd}>
        { this.props.lanes && this.renderLanes(this.props.lanes, null) }
      </DragDropContext>
    </div>);
  }

  renderButton(createOrReset: string): JSX.Element {
    let linkBase = `/admin/web/lanes/${this.props.library}/`;
    let text = createOrReset === "create" ? "Create Top-Level Lane" : "Reset All Lanes";
    let icon = createOrReset === "create" ? <AddIcon /> : <ResetIcon />;
    let disabled = this.props.orderChanged ? "disabled" : "";
    return (
      <Link
        className={`btn ${createOrReset}-lane ${disabled} ${createOrReset === "reset" ? "inverted" : ""}`}
        to={this.props.orderChanged ? null : linkBase + createOrReset}
      >
        <span>{text} {icon}</span>
      </Link>
    );
  }

  renderLanes(lanes: LaneData[], parent: LaneData | null): JSX.Element {
    const draggingLane = this.props.laneForID(null, null);
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
        renderSublanes={this.renderLanes}
      />
    );
  }

  isDropDisabled(draggingLane: LaneData | null, toLane: LaneData | null) {
    if (!draggingLane) {
      return false;
    }

    // You can only drag a lane within its parent. It would be nice
    // to change the parent by dragging, but it's difficult because
    // dragging a child can cause the parent to move and mess up
    // the positioning of the dragging child.

    const draggingParent = this.props.findParent(draggingLane);
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
