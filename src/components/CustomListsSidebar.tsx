import * as React from "react";
import PencilIcon from "./icons/PencilIcon";
import TrashIcon from "./icons/TrashIcon";
import { Button } from "library-simplified-reusable-components";
import { CustomListData } from "../interfaces";
import EditableInput from "./EditableInput";
import { Link } from "react-router";
import { ListManagerContext } from "./ListManagerContext";

export interface CustomListsSidebarProps {
  lists: CustomListData[];
  library: string;
  identifier?: string;
  deleteCustomList: (list: CustomListData) => Promise<void>;
  changeSort: () => void;
  sortOrder: "asc" | "desc";
}

export default function CustomListsSidebar({
  lists,
  library,
  identifier,
  deleteCustomList,
  changeSort,
  sortOrder,
}: CustomListsSidebarProps): JSX.Element {
  const admin = React.useContext(ListManagerContext);
  const renderSortButtons = () => {
    const sortOrders = ["asc", "desc"];
    return (
      <fieldset>
        <legend className="visuallyHidden">Select list sort type</legend>
        {sortOrders.map((order) => {
          const isChecked = sortOrder === order;
          return (
            <EditableInput
              key={order}
              type="radio"
              label={order === "asc" ? "Sort A-Z" : "Sort Z-A"}
              name="sort"
              onChange={changeSort}
              checked={isChecked}
              disabled={false}
            />
          );
        })}
      </fieldset>
    );
  };

  const renderListInfo = (list: CustomListData) => {
    const isActive = identifier === list.id.toString();

    return (
      <li key={list.id} className={isActive ? "active" : ""}>
        <div className="custom-list-info">
          <p>{list.name}</p>
          <p>Books in list: {list.entry_count}</p>
          <p>ID-{list.id}</p>
        </div>
        <div className="custom-list-buttons">
          {isActive ? (
            <Button
              disabled={true}
              content="Editing"
              className="left-align small"
            />
          ) : (
            <Link
              to={"/admin/web/lists/" + library + "/edit/" + list.id}
              className="btn left-align small"
            >
              <span>
                Edit
                <PencilIcon />
              </span>
            </Link>
          )}
          {admin && admin.isLibraryManager(library) && (
            <Button
              callback={() => deleteCustomList(list)}
              content={
                <span>
                  Delete
                  <TrashIcon />
                </span>
              }
              className="right-align small danger"
            />
          )}
        </div>
      </li>
    );
  };

  return (
    <div className="custom-lists-sidebar">
      <h2>List Manager</h2>
      <Link
        className="btn create-button"
        to={"/admin/web/lists/" + library + "/create"}
      >
        Create New List
      </Link>

      {lists && lists.length > 0 && (
        <div>
          {renderSortButtons()}
          <ul>{lists.map((list) => renderListInfo(list))}</ul>
        </div>
      )}
    </div>
  );
}
