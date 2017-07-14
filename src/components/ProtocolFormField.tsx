import * as React from "react";
import EditableInput from "./EditableInput";
import Removable from "./Removable";
import { SettingData } from "../interfaces";

export interface ProtocolFormFieldProps {
  setting: SettingData;
  disabled: boolean;
  value?: string | string[];
}

export interface ProtocolFormFieldState {
  listItems?: string [];
}

export default class ProtocolFormField extends React.Component<ProtocolFormFieldProps, ProtocolFormFieldState> {
  constructor(props) {
    super(props);
    this.state = {
      listItems: (props.value as string[]) || []
    };
    this.addListItem = this.addListItem.bind(this);
    this.removeListItem = this.removeListItem.bind(this);
    this.randomize = this.randomize.bind(this);
  }

  render(): JSX.Element {
    const setting = this.props.setting;
    if (setting.type === "text" || setting.type === undefined) {
      return (
        <div className={setting.randomizable ? "randomizable" : ""}>
          <EditableInput
            elementType="input"
            type="text"
            disabled={this.props.disabled}
            name={setting.key}
            label={setting.label + (setting.optional ? " (optional)" : "")}
            description={setting.description}
            value={this.props.value || setting.default}
            ref="element"
            />
            { setting.randomizable && !this.props.value &&
              <div className="text-right">
                <button
                  className="btn btn-default"
                  disabled={this.props.disabled}
                  onClick={this.randomize}
                  type="button">
                  Set to random value
                </button>
              </div>
            }
        </div>
      );
    } else if (setting.type === "number") {
      return (
        <EditableInput
          elementType="input"
          type="number"
          step={1}
          disabled={this.props.disabled}
          name={setting.key}
          label={setting.label + (setting.optional ? " (optional)" : "")}
          description={setting.description}
          value={this.props.value || setting.default}
          ref="element"
          />
      );
    } else if (setting.type === "select") {
      return (
        <EditableInput
          elementType="select"
          disabled={this.props.disabled}
          name={setting.key}
          label={setting.label + (setting.optional ? " (optional)" : "")}
          description={setting.description}
          value={this.props.value || setting.default}
          ref="element"
          >
          { setting.options && setting.options.map(option =>
              <option key={option.key} value={option.key}>{option.label}</option>
            )
          }
        </EditableInput>
      );
    } else if (setting.type === "list" && setting.options) {
      return (
        <div>
          <label>{setting.label + (setting.optional ? " (optional)" : "")}</label>
          { setting.description &&
            <span className="description" dangerouslySetInnerHTML={{__html: setting.description}} />
          }
          { setting.options.map(option =>
              <EditableInput
                elementType="input"
                type="checkbox"
                disabled={this.props.disabled}
                name={`${setting.key}_${option.key}`}
                label={option.label}
                checked={(this.props.value && (this.props.value.indexOf(option.key) !== -1)) || (!this.props.value && setting.default && setting.default.indexOf(option.key) !== -1)}
                />
            )
          }
        </div>
      );
    } else if (setting.type === "list") {
      return (
        <div>
          <label>{setting.label + (setting.optional ? " (optional)" : "")}</label>
          { setting.description &&
            <span className="description" dangerouslySetInnerHTML={{__html: setting.description}} />
          }
          { this.state.listItems && this.state.listItems.map(listItem =>
              <Removable
                disabled={this.props.disabled}
                onRemove={() => this.removeListItem(listItem)}
                >
                <EditableInput
                  elementType="input"
                  type="text"
                  disabled={this.props.disabled}
                  name={setting.key}
                  value={listItem}
                  />
              </Removable>
            )
          }
          <div>
            <span className="add-list-item">
              <EditableInput
                elementType="input"
                type="text"
                disabled={this.props.disabled}
                name={setting.key}
                ref="addListItem"
                />
            </span>
            <button
              type="button"
              className="btn btn-default add-list-item"
              disabled={this.props.disabled}
              onClick={this.addListItem}
              >Add</button>
          </div>
        </div>
      );
    } else if (setting.type === "image") {
      return (
        <div>
          <label>{setting.label + (setting.optional ? " (optional)" : "")}</label>
          { this.props.value &&
            <img src={String(this.props.value)} />
          }
          <EditableInput
            elementType="input"
            type="file"
            disabled={this.props.disabled}
            name={setting.key}
            description={setting.description}
            accept="image/*"
            />
        </div>
      );
    }
  }

  getValue() {
    return (this.refs["element"] as any).getValue();
  }

  removeListItem(listItem: string) {
    this.setState({ listItems: this.state.listItems.filter(stateListItem => stateListItem !== listItem) });
  }

  addListItem() {
    const listItem = (this.refs["addListItem"] as any).getValue();
    this.setState({ listItems: this.state.listItems.concat(listItem) });
    (this.refs["addListItem"] as any).clear();
  }

  randomize() {
    const element = (this.refs["element"] as any);
    const chars = "1234567890abcdefghijklmnopqrstuvwxyz!@#$%^&*()";
    let random = "";
    for (let i = 0; i < 32; i++) {
      random += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    element.setState({ value: random });
  }
}