import * as React from "react";
import { LaneData } from "../../interfaces";
import { Link } from "react-router";
import GrabIcon from "../icons/GrabIcon";
import PyramidIcon from "../icons/PyramidIcon";
import AddIcon from "../icons/AddIcon";
import PencilIcon from "../icons/PencilIcon";
import { Button } from "../ui";

export interface LaneProps {
  lane: LaneData;
  active: boolean;
  snapshot?: any;
  provided?: any;
  orderChanged: boolean;
  toggleLaneVisibility: (
    lane: LaneData,
    shouldBeVisible: boolean
  ) => Promise<void>;
  parent?: LaneData;
  library: string;
  renderLanes: (lanes: LaneData[], parent: LaneData | null) => JSX.Element;
}

export interface LaneState {
  expanded: boolean;
  visible: boolean;
}

// Individual list elements appearing in the sidebar on the Lane Manager page
export default class Lane extends React.Component<LaneProps, LaneState> {
  constructor(props: LaneProps) {
    super(props);
    // Top-level lanes start out expanded.
    this.state = {
      expanded: !this.props.parent,
      visible: this.props.lane.visible,
    };
    this.toggleExpanded = this.toggleExpanded.bind(this);
    this.toggleVisible = this.toggleVisible.bind(this);
    this.renderVisibilityToggle = this.renderVisibilityToggle.bind(this);
    this.renderButton = this.renderButton.bind(this);
  }

  render(): JSX.Element {
    const { lane, active, snapshot, provided, renderLanes } = this.props;
    const hasSublanes = lane.sublanes && !!lane.sublanes.length;

    return (
      <li key={lane.id}>
        <div
          className={
            "lane-parent" +
            (snapshot && snapshot.isDragging ? "dragging " : " ") +
            (active ? "active" : "")
          }
          ref={provided && provided.innerRef}
          style={provided && provided.draggableStyle}
          {...(provided ? provided.dragHandleProps : {})}
        >
          <div className={"lane-info" + (provided ? " draggable" : "")}>
            <span>
              {snapshot && <GrabIcon />}
              <Button
                className={`transparent ${
                  this.state.expanded ? "collapse-button" : "expand-button"
                }`}
                type="button"
                callback={this.toggleExpanded}
                aria-label={`Button to expand or collapse a lane`}
                content={<PyramidIcon />}
              />
              {lane.display_name + " (" + lane.count + ")"}
            </span>
            {this.renderVisibilityToggle()}
          </div>
          {this.state.expanded && (
            <div className="lane-buttons">
              {this.renderButton("edit")}
              {this.renderButton("create")}
            </div>
          )}
          {this.state.expanded &&
            hasSublanes &&
            renderLanes(lane.sublanes, lane)}
        </div>
        {provided && provided.placeholder}
      </li>
    );
  }

  UNSAFE_componentWillReceiveProps(newProps) {
    this.setState({
      expanded: this.state.expanded,
      visible: newProps.lane.visible,
    });
  }

  toggleVisible(): void {
    const change = !this.state.visible;
    this.props.toggleLaneVisibility(this.props.lane, change);
    this.setState({ expanded: this.state.expanded, visible: change });
  }

  renderVisibilityToggle(): JSX.Element {
    const parentHidden = this.props.parent && !this.props.parent.visible;
    const canToggle = !this.props.orderChanged && !parentHidden;
    const isVisible = this.state.visible;

    return (
      <button
        type="button"
        role="switch"
        aria-checked={isVisible}
        aria-label={
          isVisible
            ? "Lane visible — click to hide"
            : "Lane hidden — click to show"
        }
        onClick={canToggle ? this.toggleVisible : undefined}
        disabled={!canToggle}
        className={[
          "relative inline-flex items-center w-10 h-5 rounded-full border-0 transition-colors duration-200 cursor-pointer",
          isVisible ? "bg-primary" : "bg-muted",
          !canToggle ? "opacity-40 cursor-not-allowed" : "",
        ].join(" ")}
      >
        <span
          className={[
            "inline-block w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform duration-200",
            isVisible ? "translate-x-5" : "translate-x-0.5",
          ].join(" ")}
        />
      </button>
    );
  }

  renderButton(editOrCreate: string): JSX.Element {
    const link = this.props.orderChanged
      ? null
      : `/admin/web/lanes/${this.props.library}/${editOrCreate}/${this.props.lane.id}`;
    const content =
      editOrCreate === "create" ? (
        <span className="inline-flex items-center gap-1 [&_svg]:h-3 [&_svg]:w-3 [&_svg]:fill-current">
          Create Sublane
          <AddIcon />
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 [&_svg]:h-3 [&_svg]:w-3 [&_svg]:fill-current">
          Edit Lane
          <PencilIcon />
        </span>
      );

    const isCreate = editOrCreate === "create";
    const baseClasses = isCreate
      ? "inline-flex items-center justify-center h-7 px-2 text-xs font-semibold text-primary-foreground bg-primary rounded hover:bg-primary/80 transition-colors no-underline"
      : "inline-flex items-center justify-center h-7 px-2 text-xs font-semibold text-primary border border-primary rounded bg-background hover:bg-muted transition-colors no-underline";
    const disabledClasses = this.props.orderChanged
      ? " opacity-50 pointer-events-none"
      : "";

    return (
      <Link
        className={`${editOrCreate}-lane right-align ${baseClasses}${disabledClasses}`}
        to={link}
      >
        {content}
      </Link>
    );
  }

  toggleExpanded(): void {
    this.setState({
      expanded: !this.state.expanded,
      visible: this.state.visible,
    });
  }
}
