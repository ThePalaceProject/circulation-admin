/* eslint-disable react/no-deprecated */
import * as React from "react";
import { Link } from "react-router";
import { Store } from "@reduxjs/toolkit";
import { connect } from "react-redux";
import { RootState } from "../../store";
import { LaneData, CustomListData } from "../../interfaces";
import { FetchErrorData } from "@thepalaceproject/web-opds-client/lib/interfaces";
import DataFetcher from "@thepalaceproject/web-opds-client/lib/DataFetcher";
import ActionCreator from "../../actions";
import {
  lanesApi,
  isResultFetching,
  rtkErrorToFetchError,
} from "../../features/lanes/lanesSlice";
import { AppDispatch } from "../../store";
import LaneEditor from "./LaneEditor";
import LanesSidebar from "./LanesSidebar";
import LoadingIndicator from "@thepalaceproject/web-opds-client/lib/components/LoadingIndicator";
import ErrorMessage from "../shared/ErrorMessage";
import EditableInput from "../shared/EditableInput";
import { Button } from "library-simplified-reusable-components";
import ResetIcon from "../icons/ResetIcon";

export interface LanesStateProps {
  lanes: LaneData[];
  customLists: CustomListData[];
  formError?: FetchErrorData;
  fetchError?: FetchErrorData;
  isFetching: boolean;
}

export interface LanesDispatchProps {
  fetchLanes: () => void;
  fetchCustomLists: () => void;
  editLane: (data: FormData) => Promise<string | void>;
  deleteLane: (laneIdentifier: string) => Promise<void>;
  showLane: (laneIdentifier: string) => Promise<void>;
  hideLane: (laneIdentifier: string) => Promise<void>;
  resetLanes: () => Promise<void>;
  changeLaneOrder: (lanes: LaneData[]) => Promise<void>;
}

export interface LanesOwnProps {
  store?: Store<RootState>;
  library: string;
  editOrCreate?: string;
  identifier?: string;
  csrfToken: string;
}

export interface LanesProps
  extends React.Props<LanesProps>,
    LanesStateProps,
    LanesDispatchProps,
    LanesOwnProps {}

export interface LanesState {
  draggableId: string | null;
  draggingFrom: string | null;
  lanes: LaneData[];
  orderChanged: boolean;
  canReset: boolean;
}

/** Body of the lanes page, with all a library's lanes shown in a left sidebar and
    a lane editor on the right. */
export class Lanes extends React.Component<LanesProps, LanesState> {
  private resetRef = React.createRef<EditableInput>();
  static defaultProps = {
    editOrCreate: "create",
  };

  constructor(props) {
    super(props);
    this.editLane = this.editLane.bind(this);
    this.deleteLane = this.deleteLane.bind(this);
    this.resetLanes = this.resetLanes.bind(this);
    this.resetOrder = this.resetOrder.bind(this);
    this.drag = this.drag.bind(this);
    this.saveOrder = this.saveOrder.bind(this);
    this.orderChanged = this.orderChanged.bind(this);
    this.findLaneForIdentifier = this.findLaneForIdentifier.bind(this);
    this.getLane = this.getLane.bind(this);
    this.findParentOfLane = this.findParentOfLane.bind(this);
    this.toggleLaneVisibility = this.toggleLaneVisibility.bind(this);
    this.checkReset = this.checkReset.bind(this);

    this.state = {
      draggableId: null,
      draggingFrom: null,
      lanes: this.copyLanes(this.props.lanes || []),
      orderChanged: false,
      canReset: false,
    };
  }

  private copyLanes(lanes: LaneData[]): LaneData[] {
    const copy = (lane) => {
      return Object.assign({}, lane, {
        sublanes: lane.sublanes.map(copy),
      });
    };
    return lanes.map(copy);
  }

  render(): JSX.Element {
    const errorMessage = this.props.formError || this.props.fetchError;
    return (
      <main className="lanes-container">
        {errorMessage && <ErrorMessage error={errorMessage} />}
        {this.props.isFetching && <LoadingIndicator />}
        <div className="lanes">
          <LanesSidebar
            orderChanged={this.state.orderChanged}
            library={this.props.library}
            drag={this.drag}
            lanes={
              this.state.lanes &&
              this.state.lanes.length > 0 &&
              this.state.lanes
            }
            findLaneForIdentifier={this.findLaneForIdentifier}
            findParentOfLane={this.findParentOfLane}
            identifier={this.props.identifier}
            toggleLaneVisibility={this.toggleLaneVisibility}
          />
          {this.renderMainContent()}
        </div>
      </main>
    );
  }

  renderMainContent(): JSX.Element {
    if (this.state.orderChanged) {
      return this.orderChanged();
    } else if (this.props.editOrCreate === "reset") {
      return this.renderReset();
    } else if (this.props.editOrCreate) {
      return this.renderEditor(this.props.editOrCreate);
    }
  }

  orderChanged(): JSX.Element {
    return (
      <div className="order-change-info">
        <h2>Change Lane Order</h2>
        <Button
          callback={this.saveOrder}
          className="left-align inline save-lane-order-changes"
          disabled={this.props.isFetching}
          content="Save Order Changes"
        />
        <Button
          className="inverted inline cancel-lane-order-changes"
          callback={this.resetOrder}
          content={"Cancel"}
        />
        <hr />
        <p>
          Save or cancel your changes to the lane order before making additional
          changes.
        </p>
      </div>
    );
  }

  renderEditor(editOrCreate: string): JSX.Element {
    const props = {
      library: this.props.library,
      customLists: this.props.customLists,
      editLane: this.editLane,
      editOrCreate,
    };
    const extraProps = {
      create: {
        findParentOfLane: this.getLane,
      },
      edit: {
        lane: this.getLane(),
        findParentOfLane: this.findParentOfLane,
        deleteLane: this.deleteLane,
        toggleLaneVisibility: this.toggleLaneVisibility,
      },
    };
    return React.createElement(LaneEditor, {
      ...props,
      ...extraProps[editOrCreate],
    });
  }

  checkReset() {
    const inputValue =
      this.resetRef.current && this.resetRef.current.getValue();
    this.setState({ ...this.state, canReset: inputValue === "RESET" });
  }

  renderReset(): JSX.Element {
    return (
      <div className="reset">
        <h2>Reset all lanes</h2>
        <p>
          This will delete all lanes for the library and automatically generate
          new lanes based on the library's language configuration or the
          languages in the library's collection.
        </p>
        <p>
          Any lanes based on lists will be removed and will need to be created
          again (the lists will be preserved.)
        </p>
        <hr />
        <p>This cannot be undone.</p>
        <p>
          If you're sure you want to reset the lanes, type "RESET" below and
          click Reset.
        </p>
        <EditableInput
          type="text"
          ref={this.resetRef}
          required={true}
          onChange={this.checkReset}
        />
        <Button
          className="reset-button left-align danger"
          callback={this.resetLanes}
          disabled={!this.state.canReset}
          content={
            <span>
              Reset <ResetIcon />
            </span>
          }
        />
        <Link
          className="btn inverted cancel-button"
          to={`/admin/web/lanes/${this.props.library}/`}
        >
          Cancel
        </Link>
      </div>
    );
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.lanes && !this.props.lanes) {
      const lanes = this.copyLanes(nextProps.lanes);
      this.setState({
        lanes,
        draggingFrom: null,
        draggableId: null,
        orderChanged: false,
      });
    }
  }

  UNSAFE_componentWillMount() {
    if (this.props.fetchLanes) {
      this.props.fetchLanes();
    }
    if (this.props.fetchCustomLists) {
      this.props.fetchCustomLists();
    }
  }

  resetOrder() {
    this.setState({
      ...this.state,
      lanes: this.props.lanes,
      orderChanged: false,
    });
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
    if (
      window.confirm(`Delete lane "${lane.display_name}" and its sublanes?`)
    ) {
      await this.props.deleteLane(String(lane.id));
      this.props.fetchLanes();
    }
  }

  async toggleLaneVisibility(lane: LaneData, shouldBeVisible: boolean) {
    const callback = shouldBeVisible
      ? this.props.showLane
      : this.props.hideLane;
    await callback(String(lane.id));
    this.props.fetchLanes();
  }

  async resetLanes() {
    await this.props.resetLanes();
    this.props.fetchLanes();
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
      const sublaneMatch = this.findLaneForIdentifier(
        lane.sublanes,
        identifier
      );
      if (sublaneMatch) {
        return sublaneMatch;
      }
    }
    return null;
  }

  getLane(): LaneData | null {
    if (this.props.lanes) {
      return this.findLaneForIdentifier(
        this.props.lanes,
        this.props.identifier
      );
    }
    return null;
  }

  findParentOfLane(lane: LaneData, lanes?: LaneData[]): LaneData {
    if (!lanes) {
      lanes = this.state.lanes || [];
    }
    for (const possibleParent of lanes) {
      if (
        lane &&
        possibleParent.sublanes.find((child) => child["id"] === lane.id)
      ) {
        return possibleParent;
      }
      // If we didn't find the parent in this level of lanes,
      // then go one level down and look again.
      const sublaneParent = this.findParentOfLane(
        lane,
        possibleParent.sublanes
      );
      if (sublaneParent) {
        return sublaneParent;
      }
    }
    return null;
  }

  drag(newState) {
    this.setState({ ...this.state, ...newState });
  }
}

function mapStateToProps(state: RootState, ownProps: LanesOwnProps) {
  const lanesResult = lanesApi.endpoints.getLanes.select(ownProps.library)(
    state
  );
  return {
    lanes: lanesResult.data?.lanes ?? null,
    customLists:
      state.editor.customLists &&
      state.editor.customLists.data &&
      state.editor.customLists.data.custom_lists,
    fetchError:
      rtkErrorToFetchError(lanesResult.error) ||
      state.editor.lanesUi.fetchError,
    formError: state.editor.lanesUi.formError,
    isFetching:
      isResultFetching(lanesResult) ||
      state.editor.lanesUi.isMutating ||
      state.editor.customLists.isFetching,
  };
}

function mapDispatchToProps(dispatch: AppDispatch, ownProps: LanesOwnProps) {
  return {
    fetchLanes: () =>
      dispatch(lanesApi.endpoints.getLanes.initiate(ownProps.library)),
    fetchCustomLists: () => {
      const fetcher = new DataFetcher();
      const actions = new ActionCreator(fetcher, ownProps.csrfToken);
      dispatch(actions.fetchCustomLists(ownProps.library));
    },
    editLane: async (data: FormData): Promise<string | void> => {
      const result = await dispatch(
        lanesApi.endpoints.editLane.initiate({
          library: ownProps.library,
          data,
        })
      );
      if ("data" in result) return result.data;
    },
    deleteLane: async (identifier: string) => {
      await dispatch(
        lanesApi.endpoints.deleteLane.initiate({
          library: ownProps.library,
          identifier,
        })
      );
    },
    showLane: async (identifier: string) => {
      await dispatch(
        lanesApi.endpoints.showLane.initiate({
          library: ownProps.library,
          identifier,
        })
      );
    },
    hideLane: async (identifier: string) => {
      await dispatch(
        lanesApi.endpoints.hideLane.initiate({
          library: ownProps.library,
          identifier,
        })
      );
    },
    resetLanes: async () => {
      await dispatch(lanesApi.endpoints.resetLanes.initiate(ownProps.library));
    },
    changeLaneOrder: async (lanes: LaneData[]) => {
      await dispatch(
        lanesApi.endpoints.changeLaneOrder.initiate({
          library: ownProps.library,
          lanes,
        })
      );
    },
  };
}

const ConnectedLanes = connect<
  LanesStateProps,
  LanesDispatchProps,
  LanesOwnProps
>(
  mapStateToProps,
  mapDispatchToProps
)(Lanes as any);

export default ConnectedLanes;
