import * as React from "react";
import PencilIcon from "./icons/PencilIcon";
import TrashIcon from "./icons/TrashIcon";
import { Button } from "library-simplified-reusable-components";
import { ListManagerContext } from "./ListManagerContext";
import { CustomListData } from "../interfaces";
import { Link, browserHistory } from "react-router";

export interface ListInfoProps {
  list: CustomListData;
  lists?: CustomListData[];
  idx?: number;
  identifier?: string;
  deleteCustomList: (list: CustomListData) => Promise<void>;
  library: string;
}

export default function CustomListInfo({
  list,
  lists,
  idx,
  identifier,
  deleteCustomList,
  library,
}: ListInfoProps) {
  const { admin, entryCountInContext } = React.useContext(ListManagerContext);

  const isActive = identifier === list.id.toString();
  const { id, name, entry_count } = list;

  /**
   * If user deletes the active list, they will be navigated
   * to the edit form of the next list down in the sidebar. If there is
   * no next list, they will be navigated to the create form.
   */
  const deleteList = async (list) => {
    await deleteCustomList(list);
    if (isActive) {
      lists[idx + 1]
        ? browserHistory.push(
            "/admin/web/lists/" + library + "/edit/" + lists[idx + 1].id
          )
        : browserHistory.push("/admin/web/lists/" + library + "/create");
    }
  };

  return (
    <li key={id} className={isActive ? "active" : ""}>
      <div className="custom-list-info">
        <p>{name}</p>
        {/*
         * If the number of books in a list is stored in context,
         * use that number. Otherwise, use entry_count.
         */}
        <p>
          Books in list:{" "}
          {entryCountInContext[String(id)]
            ? entryCountInContext[String(id)]
            : entry_count}
        </p>
        <p>ID-{id}</p>
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
            callback={() => deleteList(list)}
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
}
