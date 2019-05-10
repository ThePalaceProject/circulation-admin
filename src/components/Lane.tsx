import * as React from "react";
import { LaneData } from "../interfaces";
import { Link } from "react-router";
import GrabIcon from "./icons/GrabIcon";
import PyramidIcon from "./icons/PyramidIcon";
import VisibleIcon from "./icons/VisibleIcon";
import HiddenIcon from "./icons/HiddenIcon";
import AddIcon from "./icons/AddIcon";
import PencilIcon from "./icons/PencilIcon";
import { Button } from "library-simplified-reusable-components";

export interface LaneProps {
  lane: LaneData;
  active: boolean;
  snapshot?: any;
  provided?: any;
  orderChanged: boolean;
  toggleLaneVisibility: (lane: LaneData, shouldBeVisible: boolean) => Promise<void>;
  parent?: LaneData;
  library: string;
  renderSublanes: (lanes: LaneData[], parent: LaneData | null) => JSX.Element;
}

export interface LaneState {
  expanded: boolean;
  visible: boolean;
}

export default class Lane extends React.Component<LaneProps, LaneState> {
  constructor(props: LaneProps) {
    super(props);
    // Top-level lanes start out expanded.
    this.state = { expanded: !this.props.parent, visible: this.props.lane.visible };
    this.toggleExpanded = this.toggleExpanded.bind(this);
    this.toggleVisible = this.toggleVisible.bind(this);
    this.renderVisibilityToggle = this.renderVisibilityToggle.bind(this);
    this.renderButton = this.renderButton.bind(this);
    this.renderSublanes = this.renderSublanes.bind(this);
  }

  render(): JSX.Element {
    let hasSublanes = this.props.lane.sublanes && !!this.props.lane.sublanes.length;
    let hasCustomLists = this.props.lane.custom_list_ids && !!this.props.lane.custom_list_ids.length;

    return (
      <li key={this.props.lane.id}>
        <div
          className={(this.props.snapshot && this.props.snapshot.isDragging ? "dragging " : " ") + (this.props.active ? "active" : "")}
          ref={this.props.provided && this.props.provided.innerRef}
          style={this.props.provided && this.props.provided.draggableStyle}
          {...(this.props.provided ? this.props.provided.dragHandleProps : {})}
        >
          <div className={"lane-info" + (this.props.provided ? " draggable" : "")}>
            <span>
              { this.props.snapshot && <GrabIcon /> }
              <div className={this.state.expanded ? "collapse-button" :  "expand-button"} onClick={this.toggleExpanded}>
                <PyramidIcon />
              </div>
              { this.props.lane.display_name + " (" + this.props.lane.count + ")" }
            </span>
            { this.renderVisibilityToggle() }
          </div>
        { this.state.expanded &&
          <div className="lane-buttons">
          { hasCustomLists && this.renderButton("edit") }
          { this.renderButton("create") }
          </div>
        }
        { this.state.expanded && hasSublanes && this.props.renderSublanes(this.props.lane.sublanes, this.props.lane) }
        </div>
        { this.props.provided && this.props.provided.placeholder }
      </li>
    );
  }

  componentWillReceiveProps(newProps) {
    this.setState({ expanded: this.state.expanded, visible: newProps.lane.visible });
  }

  toggleVisible(): void {
    let change: boolean = !this.state.visible;
    this.props.toggleLaneVisibility(this.props.lane, change);
    this.setState({ expanded: this.state.expanded, visible: change });
  }

  renderVisibilityToggle(): JSX.Element {
    // If the lane order is currently being changed, or if this lane has a parent which is hidden, disable the toggle.
    let parentHidden = this.props.parent && !this.props.parent.visible;
    let canToggle = !this.props.orderChanged && !parentHidden;
    let className = this.state.visible ? "hide-lane" : "show-lane";
    let buttonContent = this.state.visible ? <span>Visible<VisibleIcon/></span> : <span>Hidden<HiddenIcon/></span>;
    return <Button className={"small transparent top-align bottom-align " + className} disabled={!canToggle} callback={this.toggleVisible} content={buttonContent} />;
  }

  renderButton(editOrCreate: string): JSX.Element {
    let link = this.props.orderChanged ? null : `/admin/web/lanes/${this.props.library}/${editOrCreate}/${this.props.lane.id}`;
    let content = editOrCreate === "create" ? <span>Create Sublane<AddIcon /></span> : <span>Edit Lane<PencilIcon /></span>;

    let button = (
      <Link
        className={`btn small right-align ${editOrCreate}-lane ` + (this.props.orderChanged ? "disabled" : "")}
        to={link}
      >{content}</Link>
    );
    return button;
  }

  renderSublanes(): JSX.Element {
    let sublanes = [];
    this.props.lane.sublanes.map((sublane) => {
      let el = React.createElement(Lane, Object.assign({}, this.props, {lane: sublane, parent: this.props.lane}));
      sublanes.push(el);
    });
    return <ul className="droppable">{sublanes}</ul>;
  }

  toggleExpanded(): void {
    this.setState({ expanded: !this.state.expanded, visible: this.state.visible });
  }
}
