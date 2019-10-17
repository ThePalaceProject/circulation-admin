import * as React from "react";
import WithRemoveButton from "./WithRemoveButton";
import LanguageField from "./LanguageField";
import EditableInput from "./EditableInput";
import { SettingData, CustomListsSetting } from "../interfaces";
import ToolTip from "./ToolTip";
import { LocatorIcon } from "@nypl/dgx-svg-icons";
import { Button } from "library-simplified-reusable-components";
import { isEqual } from "../utils/sharedFunctions";

export interface InputListProps {
  createEditableInput: (setting: SettingData, customProps?: any, children?: JSX.Element[]) => JSX.Element;
  labelAndDescription: (SettingData) => JSX.Element[];
  setting: SettingData | CustomListsSetting;
  disabled: boolean;
  value: Array<string | {} | JSX.Element>;
  additionalData?: any;
}

export interface InputListState {
  listItems: Array<string | {}>;
  newItem?: string;
  options?: JSX.Element[];
}

export default class InputList extends React.Component<InputListProps, InputListState> {

  constructor(props) {
    super(props);
    let isMenu = props.setting.type === "menu";
    this.state = {
      listItems: (props.value as string[] || []),
      newItem: "",
      options: isMenu && this.filterMenu()
    };
    this.updateNewItem = this.updateNewItem.bind(this);
    this.addListItem = this.addListItem.bind(this);
    this.removeListItem = this.removeListItem.bind(this);
    this.clear = this.clear.bind(this);
    this.filterMenu = this.filterMenu.bind(this);
  }

  componentWillReceiveProps(newProps) {
    this.setState({ listItems: (newProps.value || []), options: this.filterMenu() });
  }

  componentDidUpdate(oldProps, oldState) {
    if (this.props.setting.format === "narrow" && !isEqual(oldState.listItems, this.state.listItems)) {
      this.setState({ options: this.filterMenu()});
    }
  }

  render(): JSX.Element {
    const setting = this.props.setting as any;
    let showButton = !this.state.options || this.state.options.length > 0;
    return (
      <div className="input-list">
        { this.props.labelAndDescription(setting) }
        { this.state.listItems && this.state.listItems.map((listItem) => {
          let value = typeof(listItem) === "string" ? listItem : Object.keys(listItem)[0];
          return (
            <WithRemoveButton
              key={value}
              disabled={this.props.disabled}
              onRemove={() => this.removeListItem(listItem)}
            >
              { this.renderListItem(setting, value, listItem) }
            </WithRemoveButton>
          );
        })}
        <div className="add-list-item-container">
          <span className="add-list-item">
            {  setting.format === "language-code" ?
                <LanguageField
                  disabled={this.props.disabled}
                  ref="addListItem"
                  name={setting.key}
                  languages={this.props.additionalData}
                  onChange={this.updateNewItem}
                /> :
                setting.type === "menu" ?
                  this.renderMenu(setting) :
                  this.props.createEditableInput(setting, {
                    value: null,
                    disabled: this.props.disabled,
                    onChange: this.updateNewItem,
                    ref: "addListItem",
                    label: null,
                    description: null
                  })
            }
          </span>
          { showButton &&
            <Button
              type="button"
              className="add-list-item inline small bottom-align"
              callback={this.addListItem}
              content="Add"
              disabled={this.props.disabled || (setting.type !== "menu" && !this.state.newItem.length)}
            />
          }
        </div>
      </div>
    );
  }

  renderListItem(setting, value, listItem) {
    if (setting.format === "language-code") {
      return (
        <LanguageField
          disabled={this.props.disabled}
          value={value}
          name={setting.key}
          languages={this.props.additionalData}
        />
      );
    } else if (setting.urlBase) {
      return (
        <a href={setting.urlBase(listItem)}>{listItem}</a>
      );
    } else {
      return (
        this.props.createEditableInput(setting, {
          type: "text",
          description: null,
          disabled: this.props.disabled,
          value: value,
          name: setting.key,
          label: null,
          extraContent: this.renderToolTip(listItem, setting.format),
          optionalText: !setting.required
        })
      );
    }
  }

  renderMenu(setting) {
    let choices = this.state.options;
    if (choices.length > 0) {
      return this.props.createEditableInput(
        setting,
        {
          elementType: "select",
          name: setting.key,
          value: setting.key,
          label: setting.menuTitle,
          required: setting.required,
          ref: "addListItem",
          optionalText: !setting.required
        }, choices
      );
    }
  }

  renderToolTip(item: {} | string, format: string) {
    const icons = {
      "geographic": <LocatorIcon />
    };

    if (typeof(item) === "object") {
      return (
        <span className="input-group-addon">
          <ToolTip trigger={icons[format]} direction="point-right" text={Object.values(item)[0].toString()} />
        </span>
      );
    }
    return null;
  }

  filterMenu() {
    // All the possibilities, regardless of whether they've already been selected.
    let allOptions = (this.props.setting as any).menuOptions;
    if (!allOptions) {
      return;
    }
    // Items that have already been selected, and should be eliminated from the menu.
    let listItems = this.state ? this.state.listItems : this.props.value;
    // Items that haven't been selected yet.
    let remainingOptions = allOptions.filter(o => listItems.indexOf(o.props.value) < 0);
    return remainingOptions;
  }

  updateNewItem() {
    let ref = this.props.setting.format === "language-code" ?
      (this.refs["addListItem"] as any).refs["autocomplete"] :
      (this.refs["addListItem"] as any);

    this.setState({...this.state, ...{ newItem: ref.getValue() }});
  }

  removeListItem(listItem: string | {}) {
    this.setState({ listItems: this.state.listItems.filter(stateListItem => stateListItem !== listItem) });
  }

  addListItem() {
    let ref = this.props.setting.format === "language-code" ?
      (this.refs["addListItem"] as any).refs["autocomplete"] :
      (this.refs["addListItem"] as any);
    const listItem = ref.getValue();
    this.setState({ listItems: this.state.listItems.concat(listItem), newItem: "" });
    ref.clear();
  }

  getValue() {
    return this.state.listItems;
  }

  clear() {
    this.setState({ listItems: [] });
  }
}
