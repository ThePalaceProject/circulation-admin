import * as React from "react";
import { CustomListData } from "../interfaces";
import { Link } from "react-router";
import SortButtons from "./SortButtons";
import CustomListInfo from "./CustomListInfo";
import { SortOrder } from "./CustomLists";

export interface CustomListsSidebarProps {
  lists: CustomListData[];
  library: string;
  identifier?: string;
  deleteCustomList: (list: CustomListData) => Promise<void>;
  changeSort: () => void;
  sortOrder: SortOrder;
}

/**
 * A child of CustomLists, the CustomListsSidebar is responsible for
 * the List Manager’s left-hand sidebar, which contains the “Create New List”
 * button followed by a preview of the existing lists – sorted A-Z or Z-A –
 * each containing an “Edit” and a “Delete” button.
 */

export default function CustomListsSidebar({
  lists,
  library,
  identifier,
  deleteCustomList,
  changeSort,
  sortOrder,
}: CustomListsSidebarProps): JSX.Element {
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
          <SortButtons changeSort={changeSort} sortOrder={sortOrder} />
          <ul>
            {lists.map((list, idx) => (
              <CustomListInfo
                key={idx}
                list={list}
                identifier={identifier}
                deleteCustomList={deleteCustomList}
                library={library}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
