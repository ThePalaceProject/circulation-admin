import * as React from "react";
import PencilIcon from "./icons/PencilIcon";
import ShareIcon from "./icons/ShareIcon";
import TrashIcon from "./icons/TrashIcon";
import VisibleIcon from "./icons/VisibleIcon";
import { Button } from "library-simplified-reusable-components";
import { CustomListData } from "../interfaces";
import EditableInput from "./EditableInput";
import { Link } from "react-router";

export interface CustomListsSidebarProps {
  lists: CustomListData[];
  library: string;
  identifier?: string;
  isLibraryManager: boolean;
  filter?: string;
  sortOrder: string;
  changeFilter?: (value: string) => void;
  changeSort: (value: string) => void;
  deleteCustomList: (list: CustomListData) => Promise<void>;
}

export default class CustomListsSidebar extends React.Component<
  CustomListsSidebarProps,
  {}
> {
  render(): JSX.Element {
    return (
      <div className="custom-lists-sidebar">
        <h2>List Manager</h2>
        <Link
          className="btn create-button"
          to={"/admin/web/lists/" + this.props.library + "/create"}
        >
          Create New List
        </Link>

        <div className="sort-filter">
          {this.renderFilterButtons()}
          {this.renderSortButtons()}
        </div>

        {this.props.lists && (
          <ul>{this.props.lists.map((list) => this.renderListInfo(list))}</ul>
        )}
      </div>
    );
  }

  renderSortButtons(): JSX.Element {
    const sortOrders = [
      ["A-Z", "asc"],
      ["Z-A", "desc"],
    ];
    return (
      <fieldset>
        <legend className="visuallyHidden">Select list sort type</legend>

        <EditableInput
          elementType="select"
          name="sort"
          label="Sort"
          value={this.props.sortOrder}
          onChange={this.props.changeSort}
        >
          {sortOrders.map(([label, value]) => (
            <option
              key={value}
              value={value}
              aria-selected={this.props.sortOrder === value}
            >
              {label}
            </option>
          ))}
        </EditableInput>
      </fieldset>
    );
  }

  renderFilterButtons(): JSX.Element {
    const filters = [
      ["All", ""],
      ["Owned", "owned"],
      ["Shared", "shared-out"],
      ["Subscribed", "shared-in"],
    ];

    return (
      <fieldset>
        <legend className="visuallyHidden">Select filter type</legend>

        <EditableInput
          elementType="select"
          name="filter"
          label="Show"
          value={this.props.filter}
          onChange={this.props.changeFilter}
        >
          {filters.map(([label, value]) => (
            <option
              key={value}
              value={value}
              aria-selected={this.props.filter === value}
            >
              {label}
            </option>
          ))}
        </EditableInput>
      </fieldset>
    );
  }

  renderListInfo(list: CustomListData): JSX.Element {
    const readOnly = !list.is_owner;

    const isActive =
      this.props.identifier &&
      this.props.identifier.toString() === list.id.toString();

    return (
      <li key={list.id} className={isActive ? "active" : ""}>
        <div className="custom-list-info">
          <div>
            {!list.is_owner && (
              <ShareIcon title="This list is shared by another library. It may be edited only by the owning library." />
            )}
            {list.name}
          </div>
          <div>Books in list: {list.entry_count}</div>
          <div>ID-{list.id}</div>
        </div>
        <div className="custom-list-buttons">
          {isActive ? (
            <Button
              disabled={true}
              content={readOnly ? "Viewing" : "Editing"}
              className="left-align small"
            />
          ) : (
            <Link
              to={"/admin/web/lists/" + this.props.library + "/edit/" + list.id}
              className="btn left-align small"
            >
              <span>
                {readOnly ? "View" : "Edit"}
                {readOnly ? <VisibleIcon /> : <PencilIcon />}
              </span>
            </Link>
          )}
          {this.props.isLibraryManager && !readOnly && !list.is_shared && (
            <Button
              callback={() => this.props.deleteCustomList(list)}
              content={
                <span>
                  Delete
                  <TrashIcon />
                </span>
              }
              className="right-align small danger"
            />
          )}
          {list.is_owner && list.is_shared && (
            <ShareIcon title="This list is shared with other libraries. It cannot be deleted." />
          )}
        </div>
      </li>
    );
  }
}
