import * as React from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Store } from "redux";
import { connect } from "react-redux";
import { State } from "../reducers/index";
import ActionCreator from "../actions";
import DataFetcher from "opds-web-client/lib/DataFetcher";
import { LaneData, LanesData, CustomListData, CustomListsData } from "../interfaces";
import { FetchErrorData } from "opds-web-client/lib/interfaces";
import LaneEditor from "./LaneEditor";
import LanesSidebar from "./LanesSidebar";
import LoadingIndicator from "opds-web-client/lib/components/LoadingIndicator";
import ErrorMessage from "./ErrorMessage";
import EditableInput from "./EditableInput";
import { Button } from "library-simplified-reusable-components";
import ResetIcon from "./icons/ResetIcon";
import XCloseIcon from "./icons/XCloseIcon";
import { Link } from "react-router";

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
    this.resetLanes = this.resetLanes.bind(this);
    this.resetOrder = this.resetOrder.bind(this);
    this.onDragStart = this.onDragStart.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
    this.saveOrder = this.saveOrder.bind(this);
    this.orderChanged = this.orderChanged.bind(this);
    this.renderEditor = this.renderEditor.bind(this);
    this.renderReset = this.renderReset.bind(this);
    this.findLaneForIdentifier = this.findLaneForIdentifier.bind(this);
    this.findParentOfLane = this.findParentOfLane.bind(this);
    this.parentOfNewLane = this.parentOfNewLane.bind(this);
    this.toggleLaneVisibility = this.toggleLaneVisibility.bind(this);

    this.state = {
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
        { errorMessage && <ErrorMessage error={errorMessage} /> }
        { this.props.isFetching && <LoadingIndicator /> }
        <div className="lanes">
          <LanesSidebar
            orderChanged={this.state.orderChanged}
            library={this.props.library}
            onDragStart={this.onDragStart}
            onDragEnd={this.onDragEnd}
            lanes={ this.state.lanes && this.state.lanes.length > 0 && this.state.lanes }
            laneForID={this.findLaneForIdentifier}
            findParent={this.findParentOfLane}
            identifier={this.props.identifier}
            toggleLaneVisibility={this.toggleLaneVisibility}
          />
          { this.state.orderChanged && this.orderChanged() }
          { !this.state.orderChanged && this.props.editOrCreate === "create" && this.renderEditor("create") }
          { !this.state.orderChanged && this.laneToEdit() && this.renderEditor("edit") }
          { !this.state.orderChanged && this.props.editOrCreate === "reset" && this.renderReset() }
        </div>
      </div>
    );
  }

  orderChanged(): JSX.Element {
    return (<div className="order-change-info">
      <h2>Change Lane Order</h2>
      <Button
        callback={this.saveOrder}
        disabled={this.props.isFetching}
        content="Save Order Changes"
      />
      <Button
        className="cancel-order-changes inverted"
        callback={this.resetOrder}
        content={<span>Cancel <XCloseIcon /></span>}
      />
      <hr />
      <p>Save or cancel your changes to the lane order before making additional changes.</p>
    </div>);
  }

  renderEditor(editOrCreate: string): JSX.Element {
    let props = {
      library: this.props.library,
      customLists: this.props.customLists,
      editLane: this.editLane
    };
    let extraProps = {
      "create": {
        findParent: this.parentOfNewLane,
        responseBody: this.props.responseBody
      },
      "edit": {
        lane: this.laneToEdit(),
        findParent: this.findParentOfLane,
        deleteLane: this.deleteLane,
        toggleLaneVisibility: this.toggleLaneVisibility
      }
    };
    return React.createElement(LaneEditor, {...props, ...extraProps[editOrCreate]});
  }

  renderReset(): JSX.Element {
    return (
      <div className="reset">
        <h2>Reset all lanes</h2>
        <p>This will delete all lanes for the library and automatically generate new lanes based on the library's language configuration or the languages in the library's collection.</p>
        <p>Any lanes based on lists will be removed and will need to be created again (the lists will be preserved.)</p>
        <hr />
        <p>This cannot be undone.</p>
        <p>If you're sure you want to reset the lanes, type "RESET" below and click Reset.</p>
        <EditableInput type="text" ref="reset" required={true}/>
        <Button
          className="reset-button left-align btn-danger"
          callback={this.resetLanes}
          content={<span>Reset <ResetIcon/></span>}
        />
        <Link
          className="btn inverted cancel-button"
          to={`/admin/web/lanes/${this.props.library}/`}
        ><span>Cancel <XCloseIcon /></span></Link>
      </div>
    );
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.lanes && !this.props.lanes) {
      const lanes = this.copyLanes(nextProps.lanes);
      this.setState({
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

  async toggleLaneVisibility(lane: LaneData, shouldBeVisible: boolean) {
    let callback = shouldBeVisible ? this.props.showLane : this.props.hideLane;
    await callback(String(lane.id));
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
    if (!lanes) {
      lanes = this.state.lanes;
    }
    if (!identifier) {
      identifier = this.state.draggableId;
    }
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
      if (possibleParent.sublanes.map(child => child["id"]).includes(lane.id)) {
        return possibleParent;
      }
      else {
        let sublaneParent = this.findParentOfLane(lane, possibleParent.sublanes);
        if (sublaneParent) {
          return sublaneParent;
        }
      }
    }
    return null;
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
