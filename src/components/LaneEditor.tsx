import * as React from "react";
import { LaneData, CustomListData } from "../interfaces";
import TextWithEditMode from "./TextWithEditMode";
import EditableInput from "./EditableInput";
import LaneCustomListsEditor from "./LaneCustomListsEditor";
import TrashIcon from "./icons/TrashIcon";
import XCloseIcon from "./icons/XCloseIcon";
import VisibleIcon from "./icons/VisibleIcon";
import HiddenIcon from "./icons/HiddenIcon";

export interface LaneEditorProps extends React.Props<LaneEditor> {
  library: string;
  parent?: LaneData;
  lane?: LaneData;
  customLists: CustomListData[];
  responseBody?: string;
  editLane: (data: FormData) => Promise<void>;
  deleteLane?: (lane: LaneData) => Promise<void>;
  showLane?: (lane: LaneData) => Promise<void>;
  hideLane?: (lane: LaneData) => Promise<void>;
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
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
    this.save = this.save.bind(this);
    this.reset = this.reset.bind(this);
  }

  render(): JSX.Element {
    return (
      <div className="lane-editor">
        <div className="lane-editor-header">
          <div>
            <div>
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
                <button
                  className="btn btn-default delete-lane"
                  onClick={this.delete}
                  >
                    Delete lane
                    <TrashIcon />
                </button>
              }
              { this.props.lane && this.props.lane.visible && this.props.hideLane &&
                <button
                  className="btn btn-default hide-lane"
                  onClick={this.hide}
                  >
                    Hide lane
                </button>
              }
              { this.props.lane && !this.props.lane.visible && this.props.showLane &&
                (!this.props.parent || (this.props.parent && this.props.parent.visible)) &&
                <button
                  className="btn btn-default show-lane"
                  onClick={this.show}
                  >
                    Show lane
                </button>
              }
              <button
                className="btn btn-default save-lane"
                onClick={this.save}
                >Save lane</button>
              { this.hasChanges() &&
                <a
                  href="#"
                  className="cancel-changes"
                  onClick={this.reset}
                  >Cancel changes
                    <XCloseIcon />
                </a>
              }
            </span>
          </div>
          <div className="lane-details">
            <h4>
            { !this.props.lane && this.props.parent &&
              <div>New sublane of {this.props.parent.display_name}</div>
            }
            { !this.props.lane && !this.props.parent &&
              <div>New top-level lane</div>
            }
            { this.props.lane && this.props.lane.visible &&
              <div>This lane is currently visible. <VisibleIcon /></div>
            }
            { this.props.lane && !this.props.lane.visible &&
              (!this.props.parent || this.props.parent.visible) &&
              <div>This lane is currently hidden. <HiddenIcon /></div>
            }
            { this.props.lane && !this.props.lane.visible &&
              this.props.parent && !this.props.parent.visible &&
              <div>This lane's parent is currently hidden. <HiddenIcon /></div>
            }
            </h4>
            { this.props.parent &&
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

  show() {
    if (this.props.showLane && this.props.lane) {
      this.props.showLane(this.props.lane);
    }
  }

  hide() {
    if (this.props.hideLane && this.props.lane) {
      this.props.hideLane(this.props.lane);
    }
  }

  save() {
    const data = new (window as any).FormData();
    if (this.props.lane) {
      data.append("id", this.props.lane.id);
    }
    if (this.props.parent) {
      data.append("parent_id", this.props.parent.id);
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
