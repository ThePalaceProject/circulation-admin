import * as React from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Store } from "redux";
import { connect } from "react-redux";
import { Link } from "react-router";
import { State } from "../reducers/index";
import ActionCreator from "../actions";
import DataFetcher from "opds-web-client/lib/DataFetcher";
import { LaneData, LanesData, CustomListData, CustomListsData } from "../interfaces";
import { FetchErrorData } from "opds-web-client/lib/interfaces";
import LaneEditor from "./LaneEditor";
import LoadingIndicator from "opds-web-client/lib/components/LoadingIndicator";
import ErrorMessage from "./ErrorMessage";
import EditableInput from "./EditableInput";
import { Button } from "library-simplified-reusable-components";
import AddIcon from "./icons/AddIcon";
import GrabIcon from "./icons/GrabIcon";
import PencilIcon from "./icons/PencilIcon";
import PyramidIcon from "./icons/PyramidIcon";
import ResetIcon from "./icons/ResetIcon";
import VisibleIcon from "./icons/VisibleIcon";
import HiddenIcon from "./icons/HiddenIcon";
import XCloseIcon from "./icons/XCloseIcon";

export interface LanesStateProps {
  lanes: LaneData[];
  customLists: CustomListData[];
  responseBody?: string;
  formError?: FetchErrorData;
  fetchError?: FetchErrorData;
  isFetching: boolean;
}

export interface LanesDispatchProps {
  fetchLanes: () => Promise<LanesData>;
  fetchCustomLists: () => Promise<CustomListsData>;
  editLane: (data: FormData) => Promise<void>;
  deleteLane: (laneIdentifier: string) => Promise<void>;
  showLane: (laneIdentifier: string) => Promise<void>;
  hideLane: (laneIdentifier: string) => Promise<void>;
  resetLanes: () => Promise<void>;
  changeLaneOrder: (lanes: LaneData[]) => Promise<void>;
}

export interface LanesOwnProps {
  store?: Store<State>;
  library: string;
  editOrCreate?: string;
  identifier?: string;
  csrfToken: string;
}

export interface LanesProps extends React.Props<LanesProps>, LanesStateProps, LanesDispatchProps, LanesOwnProps {}

export interface LanesState {
  expanded: {
    [key: string]: boolean;
  };
  draggableId: string | null;
  draggingFrom: string | null;
  lanes: LaneData[];
  orderChanged: boolean;
}

/** Body of the lanes page, with all a library's lanes shown in a left sidebar and
    a lane editor on the right. */
export class Lanes extends React.Component<LanesProps, LanesState> {
  constructor(props) {
    super(props);
    this.editLane = this.editLane.bind(this);
    this.deleteLane = this.deleteLane.bind(this);
    this.hideLane = this.hideLane.bind(this);
    this.showLane = this.showLane.bind(this);
    this.resetLanes = this.resetLanes.bind(this);
    this.toggle = this.toggle.bind(this);
    this.resetOrder = this.resetOrder.bind(this);
    this.onDragStart = this.onDragStart.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
    this.saveOrder = this.saveOrder.bind(this);

    const expanded: { [key: string]: boolean } = {};
    for (const topLevelLane of this.props.lanes || []) {
      expanded[topLevelLane.id] = true;
    }

    this.state = {
      expanded: expanded,
      draggableId: null,
      draggingFrom: null,
      lanes: this.copyLanes(this.props.lanes || []),
      orderChanged: false
    };
  }

  private copyLanes(lanes: LaneData[]): LaneData[] {
    const copy = (lane) => {
      return Object.assign({}, lane, {
        sublanes: lane.sublanes.map(copy)
      });
    };
    return lanes.map(copy);
  }

  render(): JSX.Element {
    const errorMessage = this.props.formError || this.props.fetchError;
    return (
      <div className="lanes-container">
        { errorMessage &&
          <ErrorMessage error={errorMessage} />
        }
        { this.props.isFetching &&
          <LoadingIndicator />
        }

        <div className="lanes">
          <div className="lanes-sidebar">
            <h2>Lane Manager</h2>
            <div>
              <Link
                className={"create-lane btn btn-default" + (this.state.orderChanged ? " disabled" : "")}
                to={this.state.orderChanged ? null : ("/admin/web/lanes/" + this.props.library + "/create")}
                >
                  Create Top-Level Lane
                  <AddIcon />
              </Link>
              <Link
                className={"reset-lanes btn" + (this.state.orderChanged ? " disabled" : "")}
                to={this.state.orderChanged ? null : ("/admin/web/lanes/" + this.props.library + "/reset")}
                >
                  Reset all lanes
                  <ResetIcon />
              </Link>
            </div>
            <DragDropContext onDragStart={this.onDragStart} onDragEnd={this.onDragEnd}>
              { this.state.lanes && this.state.lanes.length > 0 && this.renderLanes(this.state.lanes, null) }
            </DragDropContext>
          </div>

          { this.state.orderChanged &&
            <div className="order-change-info">
              <h2>Change Lane Order</h2>
              <Button
                callback={this.saveOrder}
                disabled={this.props.isFetching}
                content="Save Order Changes"
              />
              <a
                href="#"
                className="cancel-order-changes"
                onClick={this.resetOrder}
                >Cancel
                  <XCloseIcon />
              </a>
              <hr />
              <p>Save or cancel your changes to the lane order before making additional changes.</p>
            </div>
          }

          { !this.state.orderChanged && this.props.editOrCreate === "create" &&
            <LaneEditor
              library={this.props.library}
              parent={this.parentOfNewLane()}
              customLists={this.props.customLists}
              editLane={this.editLane}
              responseBody={this.props.responseBody}
              />
          }

          { !this.state.orderChanged && this.laneToEdit() &&
            <LaneEditor
              library={this.props.library}
              lane={this.laneToEdit()}
              parent={this.findParentOfLane(this.laneToEdit())}
              customLists={this.props.customLists}
              editLane={this.editLane}
              deleteLane={this.deleteLane}
              hideLane={this.hideLane}
              showLane={this.showLane}
              />
          }

          { !this.state.orderChanged && this.props.editOrCreate === "reset" &&
            <div className="reset">
              <h2>Reset all lanes</h2>
              <p>This will delete all lanes for the library and automatically generate new lanes based on the library's language configuration or the languages in the library's collection.</p>
              <p>Any lanes based on lists will be removed and will need to be created again (the lists will be preserved.)</p>
              <hr />
              <p>This cannot be undone.</p>
              <p>If you're sure you want to reset the lanes, type "RESET" below and click Reset.</p>
              <EditableInput type="text" ref="reset" />
              <button
                className="btn btn-default reset-button"
                onClick={this.resetLanes}
                >Reset <ResetIcon /></button>
            </div>
          }
        </div>
      </div>
    );
  }

  renderLanes(lanes: LaneData[], parent: LaneData | null): JSX.Element {
    const draggingLane = this.findLaneForIdentifier(this.state.lanes, this.state.draggableId);
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
                    {(provided, snapshot) => this.renderLane(lane, parent, provided, snapshot) }
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

  renderLane(lane: LaneData, parent: LaneData | null, provided?, snapshot?) {
    return (
      <li>
        <div
          className={(snapshot && snapshot.isDragging ? "dragging " : " ") + ((String(lane.id) === this.props.identifier) ? "active" : "")}
          ref={provided && provided.innerRef}
          style={provided && provided.draggableStyle}
          {...(provided ? provided.dragHandleProps : {})}
          >
          <div className={"lane-info" + (provided ? " draggable" : "")}>
            <span>
              { snapshot && <GrabIcon /> }
              <div className={this.isExpanded(lane) ? "collapse-button" :  "expand-button"} onClick={() => { this.toggle(lane); }}>
                <PyramidIcon />
              </div>
              { lane.display_name + " (" + lane.count + ")" }
            </span>
            { lane.visible && !this.state.orderChanged &&
              <a
                className="hide-lane"
                href="#"
                onClick={() => { this.hideLane(lane); }}
                >Visible <VisibleIcon /></a>
            }
            { lane.visible && this.state.orderChanged &&
              <span>Visible <VisibleIcon /></span>
            }
            { !lane.visible && !this.state.orderChanged &&
              (!parent || (parent && parent.visible)) &&
              <a
                className="show-lane"
                href="#"
                onClick={() => { this.showLane(lane); }}
                >Hidden <HiddenIcon /></a>
            }
            { !lane.visible &&
              (this.state.orderChanged || (parent && !parent.visible)) &&
              <span>Hidden <HiddenIcon /></span>
            }
          </div>
          { this.isExpanded(lane) &&
            <div className="lane-buttons">
              { lane.custom_list_ids && lane.custom_list_ids.length > 0 &&
                <Link
                  className={"edit-lane btn btn-default" + (this.state.orderChanged ? " disabled" : "")}
                  to={this.state.orderChanged ? null : "/admin/web/lanes/" + this.props.library + "/edit/" + lane.id }
                  >
                  Edit Lane
                  <PencilIcon />
                </Link>
              }
              <Link
                className={"create-lane btn btn-default" + (this.state.orderChanged ? " disabled" : "")}
                to={this.state.orderChanged ? null : "/admin/web/lanes/" + this.props.library + "/create/" + lane.id }
                >
                  Create Sublane
                  <AddIcon />
              </Link>
            </div>
          }
          { this.isExpanded(lane) && lane.sublanes && lane.sublanes.length > 0 && this.renderLanes(lane.sublanes, lane) }
        </div>
        { provided && provided.placeholder }
      </li>
    );
  }

  isExpanded(lane): boolean {
    return !!this.state.expanded[lane.id];
  }

  toggle(lane) {
    const expanded = Object.assign({}, this.state.expanded);
    expanded[lane.id] = !expanded[lane.id];
    this.setState({ ...this.state, expanded });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.lanes && !this.props.lanes) {
      const expanded: { [key: string]: boolean } = {};
      for (const topLevelLane of nextProps.lanes || []) {
        expanded[topLevelLane.id] = true;
      }
      const lanes = this.copyLanes(nextProps.lanes);
      this.setState({
        expanded,
        lanes,
        draggingFrom: null,
        draggableId: null,
        orderChanged: false
      });
    }
  }

  componentWillMount() {
    if (this.props.fetchLanes) {
      this.props.fetchLanes();
    }
    if (this.props.fetchCustomLists) {
      this.props.fetchCustomLists();
    }
  }

  resetOrder() {
    this.setState({ ...this.state, lanes: this.props.lanes, orderChanged: false });
  }

  async saveOrder() {
    await this.props.changeLaneOrder(this.state.lanes);
    this.props.fetchLanes();
  }

  async editLane(data: FormData): Promise<void> {
    await this.props.editLane(data);
    this.props.fetchLanes();
  }

  async deleteLane(lane: LaneData): Promise<void> {
    if (window.confirm("Delete lane \"" + lane.display_name + "\" and its sublanes?")) {
      await this.props.deleteLane(String(lane.id));
      this.props.fetchLanes();
    }
  }

  async showLane(lane: LaneData) {
    await this.props.showLane(String(lane.id));
    this.props.fetchLanes();
  }

  async hideLane(lane: LaneData) {
    await this.props.hideLane(String(lane.id));
    this.props.fetchLanes();
  }

  async resetLanes() {
    let resetInput = this.refs["reset"] as EditableInput;
    if (resetInput.getValue() === "RESET") {
      await this.props.resetLanes();
      this.props.fetchLanes();
    }
  }

  private findLaneForIdentifier(lanes, identifier): LaneData | null {
    for (const lane of lanes) {
      if (String(lane.id) === String(identifier)) {
        return lane;
      }
      const sublaneMatch = this.findLaneForIdentifier(lane.sublanes, identifier);
      if (sublaneMatch) {
        return sublaneMatch;
      }
    }
    return null;
  }

  laneToEdit(): LaneData | null {
    if (this.props.editOrCreate === "edit" && this.props.lanes) {
      return this.findLaneForIdentifier(this.props.lanes, this.props.identifier);
    }
    return null;
  }

  parentOfNewLane(): LaneData | null {
    if (this.props.editOrCreate === "create" && this.props.lanes) {
      return this.findLaneForIdentifier(this.props.lanes, this.props.identifier);
    }
    return null;
  }

  findParentOfLane(lane: LaneData, lanes?: LaneData[]): LaneData {
    if (!lanes) {
      lanes = this.state.lanes || [];
    }

    for (const possibleParent of lanes) {
      for (const child of possibleParent.sublanes) {
        if (child.id === lane.id) {
          return possibleParent;
        }
      }

      let sublaneParent = this.findParentOfLane(lane, possibleParent.sublanes);
      if (sublaneParent) {
        return sublaneParent;
      }
    }
    return null;
  }

  isDropDisabled(draggingLane: LaneData | null, toLane: LaneData | null) {
    if (!draggingLane) {
      return false;
    }

    // You can only drag a lane within its parent. It would be nice
    // to change the parent by dragging, but it's difficult because
    // dragging a child can cause the parent to move and mess up
    // the positioning of the dragging child.

    const draggingParent = this.findParentOfLane(draggingLane);
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

  onDragStart(initial) {
    document.body.classList.add("dragging");
    const draggableId = initial.draggableId;
    const source = initial.source;
    this.setState({
      ...this.state,
      draggableId,
      draggingFrom: source.droppableId
    });
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

    let lanes = this.state.lanes;
    const draggedLane = this.findLaneForIdentifier(lanes, draggableId);
    const parent = this.findParentOfLane(draggedLane, lanes);

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

    this.setState({
      ...this.state,
      draggableId: null,
      draggingFrom: null,
      lanes,
      orderChanged: true
    });
  }
}

function mapStateToProps(state, ownProps) {
  return {
    lanes: state.editor.lanes && state.editor.lanes.data && state.editor.lanes.data.lanes,
    responseBody: state.editor.lanes && state.editor.lanes.successMessage,
    customLists: state.editor.customLists && state.editor.customLists.data && state.editor.customLists.data.custom_lists,
    fetchError: state.editor.lanes.fetchError || state.editor.laneVisibility.fetchError || state.editor.laneOrder.fetchError,
    formError: state.editor.lanes.formError || state.editor.laneVisibility.formError,
    isFetching: state.editor.lanes.isFetching || state.editor.lanes.isEditing || state.editor.laneVisibility.isFetching || state.editor.customLists.isFetching || state.editor.resetLanes.isFetching || state.editor.laneOrder.isFetching
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  let fetcher = new DataFetcher();
  let actions = new ActionCreator(fetcher, ownProps.csrfToken);
  return {
    fetchLanes: () => dispatch(actions.fetchLanes(ownProps.library)),
    fetchCustomLists: () => dispatch(actions.fetchCustomLists(ownProps.library)),
    editLane: (data: FormData) => dispatch(actions.editLane(ownProps.library, data)),
    deleteLane: (identifier: string) => dispatch(actions.deleteLane(ownProps.library, identifier)),
    showLane: (identifier: string) => dispatch(actions.showLane(ownProps.library, identifier)),
    hideLane: (identifier: string) => dispatch(actions.hideLane(ownProps.library, identifier)),
    resetLanes: () => dispatch(actions.resetLanes(ownProps.library)),
    changeLaneOrder: (lanes: LaneData[]) => dispatch(actions.changeLaneOrder(ownProps.library, lanes))
  };
}

const ConnectedLanes = connect<LanesStateProps, LanesDispatchProps, LanesOwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(Lanes);

export default ConnectedLanes;
