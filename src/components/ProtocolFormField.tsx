import * as React from "react";
import EditableInput from "./EditableInput";
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
            value={this.props.value || setting.default}
            ref="element"
            />
            { setting.randomizable &&
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
    } else if (setting.type === "select") {
      return (
        <EditableInput
          elementType="select"
          disabled={this.props.disabled}
          name={setting.key}
          label={setting.label + (setting.optional ? " (optional)" : "")}
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
          <h3>{setting.label}</h3>
          { setting.options.map(option =>
              <EditableInput
                elementType="input"
                type="checkbox"
                disabled={this.props.disabled}
                name={`${setting.key}_${option.key}`}
                label={option.label}
                checked={this.props.value && (this.props.value.indexOf(option.key) !== -1)}
                />
            )
          }
        </div>
      );
    } else if (setting.type === "list") {
      return (
        <div>
          <h3>{setting.label}</h3>
          { this.state.listItems && this.state.listItems.map(listItem =>
              <div className="form-group">
                <EditableInput
                  elementType="input"
                  type="text"
                  disabled={this.props.disabled}
                  name={setting.key}
                  value={listItem}
                  />
                <i
                  className="fa fa-times"
                  aria-hidden="true"
                  onClick={() => !this.props.disabled && this.removeListItem(listItem)}
                  ></i>
                <a
                  className="sr-only"
                  onClick={() => !this.props.disabled && this.removeListItem(listItem)}
                  >remove</a>
              </div>
            )
          }
          <div className="form-group">
            <EditableInput
              elementType="input"
              type="text"
              disabled={this.props.disabled}
              name={setting.key}
              ref="addListItem"
              />
            <button
              type="button"
              className="btn btn-default add-list-item"
              disabled={this.props.disabled}
              onClick={this.addListItem}
              >Add</button>
          </div>
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
    const chars = "1234567890abcdef";
    let random = "";
    for (let i = 0; i < 32; i++) {
      random += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    element.setState({ value: random });
  }
}