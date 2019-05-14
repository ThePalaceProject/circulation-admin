import * as React from "react";
import { LaneData, CustomListData } from "../interfaces";
import { Button } from "library-simplified-reusable-components";
import TextWithEditMode from "./TextWithEditMode";
import EditableInput from "./EditableInput";
import LaneCustomListsEditor from "./LaneCustomListsEditor";
import TrashIcon from "./icons/TrashIcon";
import XCloseIcon from "./icons/XCloseIcon";
import VisibleIcon from "./icons/VisibleIcon";
import HiddenIcon from "./icons/HiddenIcon";

export interface LaneEditorProps extends React.Props<LaneEditor> {
  library: string;
  lane?: LaneData;
  customLists: CustomListData[];
  responseBody?: string;
  editLane: (data: FormData) => Promise<void>;
  deleteLane?: (lane: LaneData) => Promise<void>;
  toggleLaneVisibility: (lane: LaneData, shouldBeVisible: boolean) => Promise<void>;
  findParentOfLane: (lane: LaneData) => LaneData | null;
}

export interface LaneEditorState {
  name: string;
  customListIds: number[];
  inheritParentRestrictions: boolean;
}

/** Right panel of the lanes page for editing a single lane. */
export default class LaneEditor extends React.Component<LaneEditorProps, LaneEditorState> {
  constructor(props) {
    super(props);
    this.state = {
      name: this.props.lane && this.props.lane.display_name,
      customListIds: this.props.lane && this.props.lane.custom_list_ids || [],
      inheritParentRestrictions: this.props.lane && this.props.lane.inherit_parent_restrictions
    };
    this.changeName = this.changeName.bind(this);
    this.changeCustomLists = this.changeCustomLists.bind(this);
    this.changeInheritParentRestrictions = this.changeInheritParentRestrictions.bind(this);
    this.delete = this.delete.bind(this);
    this.save = this.save.bind(this);
    this.reset = this.reset.bind(this);
    this.visibilityToggle = this.visibilityToggle.bind(this);
    this.renderInfo = this.renderInfo.bind(this);
  }

  render(): JSX.Element {
    let parent = this.props.findParentOfLane(this.props.lane);
    return (
      <div className="lane-editor">
        <div className="lane-editor-header">
          <div>
            <div className="save-or-edit">
              <TextWithEditMode
                text={this.props.lane && this.props.lane.display_name}
                placeholder="name"
                onUpdate={this.changeName}
                ref="laneName"
                />
              { this.props.lane &&
                <h4>ID-{this.props.lane.id}</h4>
              }
            </div>
            <span>
              { this.props.lane && this.props.deleteLane &&
                <Button
                  className="btn-danger delete-lane"
                  callback={this.delete}
                  content={<span>Delete lane <TrashIcon /></span>}
                />
              }
              { this.visibilityToggle() }
              <Button
                className="save-lane"
                callback={this.save}
                content="Save lane"
              />
              { this.hasChanges() &&
                <Button
                  className="cancel-changes inverted"
                  callback={this.reset}
                  content="Cancel changes"
                />
              }
            </span>
          </div>
          <div className="lane-details">
            {this.renderInfo(parent)}
            { parent &&
              <EditableInput
                type="checkbox"
                name="inherit_parent_restrictions"
                checked={this.state.inheritParentRestrictions}
                label="Inherit restrictions from parent lane"
                onChange={this.changeInheritParentRestrictions}
                />
            }
          </div>
        </div>
        <div className="lane-editor-body">
          <LaneCustomListsEditor
            allCustomLists={this.props.customLists}
            customListIds={this.props.lane && this.props.lane.custom_list_ids}
            onUpdate={this.changeCustomLists}
            ref="laneCustomLists"
            />
        </div>
      </div>
    );
  }

  renderInfo(parent?: LaneData): JSX.Element {
    let isVisible = (lane: LaneData) => lane.visible;

    if (this.props.lane) {
      let visibility;
      if (isVisible(this.props.lane)) {
        visibility = <div>This lane is currently visible. <VisibleIcon /></div>;
      } else if (parent && !isVisible(parent)) {
        visibility = <div>This lane's parent is currently hidden. <HiddenIcon /></div>;
      } else {
        visibility = <div>This lane is currently hidden. <HiddenIcon /></div>;
      }
      return visibility;
    } else {
      let laneLevel = parent ? `sublane of ${parent.display_name}` : "top-level lane";
      return <div>New {laneLevel}</div>;
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.lane && (!nextProps.lane || nextProps.lane.id !== this.props.lane.id) ) {
      this.setState({
        name: nextProps.lane && nextProps.lane.display_name,
        customListIds: nextProps.lane && nextProps.lane.custom_list_ids || [],
        inheritParentRestrictions: nextProps.lane && nextProps.lane.inherit_parent_restrictions
      });
    }
  }

  hasChanges(): boolean {
    const nameChanged = (this.props.lane && this.props.lane.display_name !== this.state.name);
    let listsChanged = false;
    if (this.props.lane && this.props.lane.custom_list_ids.length !== this.state.customListIds.length) {
      listsChanged = true;
    } else {
      let propsListIds = this.props.lane && this.props.lane.custom_list_ids.sort() || [];
      let stateListIds = this.state.customListIds.sort();
      for (let i = 0; i < propsListIds.length; i++) {
        if (propsListIds[i] !== stateListIds[i]) {
          listsChanged = true;
          break;
        }
      }
    }
    let inheritParentRestrictionsChanged = false;
    if (this.props.lane && this.props.lane.inherit_parent_restrictions !== this.state.inheritParentRestrictions) {
      inheritParentRestrictionsChanged = true;
    }
    return nameChanged || listsChanged || inheritParentRestrictionsChanged;
  }

  changeName(name: string) {
    this.setState(Object.assign({}, this.state, { name }));
  }

  changeCustomLists(customListIds: number[]) {
    this.setState(Object.assign({}, this.state, { customListIds }));
  }

  changeInheritParentRestrictions() {
    let inheritParentRestrictions = !this.state.inheritParentRestrictions;
    this.setState(Object.assign({}, this.state, { inheritParentRestrictions }));
  }

  delete() {
    if (this.props.deleteLane && this.props.lane) {
      this.props.deleteLane(this.props.lane);
    }
  }

  visibilityToggle() {
    // The lane's visibility cannot be changed if it has a hidden parent.  In all other cases--i.e.
    // if 1) the lane does not have a parent or 2) the lane has a parent which is visible--we render
    // the hide/show button.
    let parent = this.props.findParentOfLane(this.props.lane);
    let canToggle = this.props.lane && (!parent || (parent && parent.visible));
    if (canToggle) {
      return (<Button
                className={this.props.lane.visible ? "hide-lane" : "show-lane"}
                content={`${this.props.lane.visible ? "Hide" : "Show"} lane`}
                callback={() => this.props.toggleLaneVisibility(this.props.lane, !this.props.lane.visible)}
             />);
    }
  }

  save() {
    let parent = this.props.findParentOfLane(this.props.lane);
    const data = new (window as any).FormData();
    if (this.props.lane) {
      data.append("id", this.props.lane.id);
    }
    if (parent) {
      data.append("parent_id", parent.id);
    }
    let name = (this.refs["laneName"] as TextWithEditMode).getText();
    data.append("display_name", name);
    let listIds = (this.refs["laneCustomLists"] as LaneCustomListsEditor).getCustomListIds();
    data.append("custom_list_ids", JSON.stringify(listIds));
    data.append("inherit_parent_restrictions", this.state.inheritParentRestrictions);
    this.props.editLane(data).then(() => {
      // If a new lane was created, go to its edit page.
      if (!this.props.lane && this.props.responseBody) {
        window.location.href = "/admin/web/lanes/" + this.props.library + "/edit/" + this.props.responseBody;
      }
    });
  }

  reset() {
    (this.refs["laneName"] as TextWithEditMode).reset();
    (this.refs["laneCustomLists"] as LaneCustomListsEditor).reset();
    let inheritParentRestrictions = this.props.lane && this.props.lane.inherit_parent_restrictions;
    this.setState(Object.assign({}, this.state, { inheritParentRestrictions }));
  }
}
