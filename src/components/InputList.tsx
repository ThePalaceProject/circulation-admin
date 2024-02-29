import * as React from "react";
import WithRemoveButton from "./WithRemoveButton";
import LanguageField from "./LanguageField";
import { SettingData, CustomListsSetting } from "../interfaces";
import ToolTip from "./ToolTip";
import { LocatorIcon } from "@nypl/dgx-svg-icons";
import { Button } from "library-simplified-reusable-components";
import { isEqual, formatString } from "../utils/sharedFunctions";

export interface InputListProps {
  createEditableInput: (
    setting: SettingData,
    customProps?: any,
    children?: JSX.Element[]
  ) => JSX.Element;
  labelAndDescription?: (setting: SettingData) => JSX.Element[];
  setting: SettingData | CustomListsSetting;
  disabled: boolean;
  value: Array<string | object | JSX.Element>;
  altValue?: string;
  additionalData?: any;
  onSubmit?: any;
  onEmpty?: string;
  title?: string;
  capitalize?: boolean;
  onChange?: (value: any) => unknown;
  readOnly?: boolean;
  disableButton?: boolean;
}

export interface InputListState {
  listItems: Array<string | object>;
  newItem?: string;
  options?: JSX.Element[];
}

export default class InputList extends React.Component<
  InputListProps,
  InputListState
> {
  private addListItemRef = React.createRef<LanguageField>();
  constructor(props: InputListProps) {
    super(props);
    const isMenu = props.setting.type === "menu";
    this.state = {
      listItems:
        (props.value as string[]) || (props.setting.default as string[]) || [],
      newItem: "",
      options: isMenu && this.filterMenu(),
    };
    this.updateNewItem = this.updateNewItem.bind(this);
    this.addListItem = this.addListItem.bind(this);
    this.removeListItem = this.removeListItem.bind(this);
    this.clear = this.clear.bind(this);
    this.filterMenu = this.filterMenu.bind(this);
    this.capitalize = this.capitalize.bind(this);
  }

  UNSAFE_componentWillReceiveProps(newProps: InputListProps) {
    // Update the list of existing items with value from new props
    if (
      this.state.listItems &&
      newProps.value &&
      !isEqual(this.state.listItems, newProps.value)
    ) {
      this.setState({ listItems: newProps.value });
    }
  }

  componentDidUpdate(oldProps: InputListProps, oldState: InputListState) {
    // Remove already-selected items from the dropdown menu
    if (
      oldState.listItems &&
      this.state.listItems &&
      !isEqual(oldState.listItems, this.state.listItems)
    ) {
      this.props.setting.format === "narrow" &&
        this.setState({ options: this.filterMenu() });
    }
  }

  render(): JSX.Element {
    const setting = this.props.setting as any;
    // Hide the "Add" button if there are no options left
    const showButton = !this.state.options || this.state.options.length > 0;
    const hasListItems =
      this.state.listItems && this.state.listItems.length > 0;
    let element: string | JSX.Element;
    // Disable the button if 1) the whole component is supposed to be disabled,
    // 2) the admin isn't authorized to add items to the list, or 3) the input field is blank.
    const disableButton =
      this.props.disabled ||
      this.props.disableButton ||
      (setting.type !== "menu" && !this.state.newItem.length);
    if (setting.format === "language-code") {
      element = (
        <LanguageField
          disabled={this.props.disabled}
          ref={this.addListItemRef}
          name={setting.key}
          languages={this.props.additionalData}
          onChange={this.updateNewItem}
        />
      );
    } else if (setting.type === "menu") {
      element = this.renderMenu(setting);
    } else {
      element = this.props.createEditableInput(setting, {
        value: null,
        disabled: this.props.disabled,
        onChange: this.updateNewItem,
        ref: this.addListItemRef,
        label: null,
        description: null,
        readOnly: this.props.readOnly,
      });
    }
    return (
      <div className="input-list">
        {this.props.labelAndDescription &&
          this.props.labelAndDescription(setting)}
        {this.props.altValue && !hasListItems && (
          <span>{this.props.altValue}</span>
        )}
        {this.props.title && hasListItems && <h4>{this.props.title}</h4>}
        {hasListItems && this.renderList(this.state.listItems, setting)}
        <div className="add-list-item-container">
          <span className="add-list-item">{element}</span>
          {showButton && (
            <Button
              type="button"
              className="add-list-item inline small bottom-align"
              callback={this.addListItem}
              content="Add"
              disabled={disableButton}
            />
          )}
        </div>
      </div>
    );
  }

  renderList(listItems, setting: SettingData) {
    return (
      <ul className="input-list-ul">
        {listItems
          .filter((listItem) => listItem)
          .map((listItem) => {
            const value =
              typeof listItem === "string"
                ? listItem
                : Object.keys(listItem)[0];
            return this.renderListItem(setting, value, listItem);
          })}
      </ul>
    );
  }

  renderListItem(setting: SettingData, value: string, listItem) {
    let item: JSX.Element;
    const label = setting.options
      ? setting.options.find((o) => o.key === value)?.label
      : value;
    if (setting.format === "language-code") {
      item = (
        <LanguageField
          disabled={this.props.disabled}
          value={value}
          name={setting.key}
          languages={this.props.additionalData}
        />
      );
    } else if (setting.urlBase) {
      // Use information stored in the parent component to render the list item as a link
      item = <a href={setting.urlBase(listItem)}>{listItem}</a>;
    } else {
      item = this.props.createEditableInput(setting, {
        type: "text",
        description: null,
        disabled: this.props.disabled,
        value: label,
        name: setting.type === "menu" ? `${setting.key}_${value}` : setting.key,
        label: null,
        extraContent: this.renderToolTip(listItem, setting.format),
        optionalText: false,
        readOnly: this.props.readOnly,
      });
    }
    // Disable the delete button in the WithRemoveButton component if 1) the whole InputList is supposed to be disabled,
    // or 2) the admin isn't authorized to delete items from the list
    const disableRemoveButton = this.props.disabled || this.props.disableButton;
    return (
      <li className="input-list-item" key={value}>
        <WithRemoveButton
          disabled={disableRemoveButton}
          onRemove={() => this.removeListItem(listItem)}
        >
          {item}
        </WithRemoveButton>
      </li>
    );
  }

  renderMenu(setting: CustomListsSetting) {
    const choices = this.state.options;
    // If there are no available options, don't show the menu
    if (choices && choices.length > 0) {
      return this.props.createEditableInput(
        setting,
        {
          elementType: "select",
          name: setting.key + "_menu",
          value: setting.key,
          label: setting.menuTitle,
          required: setting.required,
          ref: this.addListItemRef,
          optionalText: !setting.required,
          description: !setting.required ? "(Optional) " : "",
        },
        choices
      );
    } else if (this.props.onEmpty) {
      // Optionally render a string telling the user that there are no more available choices.
      return this.props.onEmpty;
    }
  }

  renderToolTip(item: object | string, format: string) {
    const icons = {
      geographic: <LocatorIcon />,
    };

    if (typeof item === "object") {
      return (
        <span className="input-group-addon">
          <ToolTip
            trigger={icons[format]}
            direction="point-right"
            text={Object.values(item)[0].toString()}
          />
        </span>
      );
    }
    return null;
  }

  filterMenu() {
    // All the possibilities, regardless of whether they've already been selected.
    let allOptions = (this.props.setting as any).menuOptions;
    // The setting probably came with menuOptions--an array of HTML option elements.  If not, we can try to make them here.
    // If that doesn't work--e.g. because not everything has a key and label attribute--just return rather than throwing an error
    // and crashing.
    if (!allOptions) {
      try {
        allOptions = this.props.setting.options.map((o) => (
          <option key={o.key} value={o.key} aria-selected={false}>
            {o.label}
          </option>
        ));
      } catch {
        return;
      }
    }
    // Items that have already been selected, and should be eliminated from the menu.
    const listItems = this.state?.listItems
      ? this.state.listItems
      : this.props.value || this.props.setting.default || [];
    // Items that haven't been selected yet.
    const remainingOptions = listItems
      ? allOptions.filter((o) => listItems.indexOf(o.props.value) < 0)
      : [];
    return remainingOptions;
  }

  updateNewItem() {
    const ref =
      this.props.setting.format === "language-code"
        ? this.addListItemRef.current.autocompleteRef.current
        : this.addListItemRef.current;
    this.setState({ ...this.state, ...{ newItem: (ref as any).getValue() } });
  }

  async removeListItem(listItem: string | object) {
    await this.setState({
      listItems: this.state.listItems.filter(
        (stateListItem) => stateListItem !== listItem
      ),
    });
    this.props.onChange && this.props.onChange(this.state);
    // Actually save the changes instead of just manipulating the state
    if (this.props.onSubmit) {
      await this.props.onSubmit();
    }
  }

  async addListItem() {
    const ref =
      this.props.setting.format === "language-code"
        ? this.addListItemRef.current.autocompleteRef.current
        : this.addListItemRef.current;
    const listItem = this.props.setting.capitalize
      ? this.capitalize((ref as any).getValue())
      : (ref as any).getValue();
    await this.setState({
      listItems: this.state.listItems.concat(listItem),
      newItem: "",
    });
    this.props.onChange && this.props.onChange(this.state);
    // Actually save the changes instead of just manipulating the state
    if (this.props.onSubmit) {
      await this.props.onSubmit();
    }
    if (this.props.setting.type !== "menu") {
      (ref as any).clear();
    }
  }

  capitalize(value: string): string {
    // If it's a state/province abbreviation, the whole thing should be uppercase.  Otherwise, just capitalize
    // the first letter of each word.
    return value
      .split(" ")
      .map((x) =>
        x.length === 2 && this.props.setting.format === "geographic"
          ? x.toUpperCase()
          : formatString(x)
      )
      .join(" ");
  }

  getValue() {
    return this.state.listItems;
  }

  clear() {
    this.setState({ listItems: [] });
  }
}
