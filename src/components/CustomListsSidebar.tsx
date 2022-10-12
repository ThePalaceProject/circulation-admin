import * as React from "react";
import { CustomListData } from "../interfaces";
import { Link } from "react-router";
import SortButtons from "./SortButtons";
import CustomListInfo from "./CustomListInfo";
export interface CustomListsSidebarProps {
  changeSort: () => void;
  deleteCustomList: (list: CustomListData) => Promise<void>;
  identifier?: string;
  isSortedAtoZ: boolean;
  library: string;
  lists: CustomListData[];
  resetResponseBodyState: () => void;
}

// A child of CustomLists, the CustomListsSidebar is responsible for
// the List Manager’s left-hand sidebar, which contains the “Create New List”
// button followed by a preview of the existing lists – sorted A-Z or Z-A –
// each containing an “Edit” and a “Delete” button.
export default function CustomListsSidebar({
  changeSort,
  deleteCustomList,
  identifier,
  isSortedAtoZ,
  library,
  lists,
  resetResponseBodyState,
}: CustomListsSidebarProps): JSX.Element {
  const startNewList = () => {
    resetResponseBodyState();
  };

  return (
    <div className="custom-lists-sidebar">
      <h2>List Manager</h2>
      <Link
        className="btn create-button"
        onClick={startNewList}
        role="button"
        to={`/admin/web/lists/${library}/create`}
      >
        Create New List
      </Link>
      {lists && lists.length && (
        <div>
          <SortButtons changeSort={changeSort} isSortedAtoZ={isSortedAtoZ} />
          <ul>
            {lists.map((list, idx) => (
              <CustomListInfo
                deleteCustomList={deleteCustomList}
                identifier={identifier}
                idx={idx}
                key={idx}
                library={library}
                list={list}
                lists={lists}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
