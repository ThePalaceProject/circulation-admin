import * as React from "react";
import PencilIcon from "./icons/PencilIcon";
import TrashIcon from "./icons/TrashIcon";
import { Button } from "library-simplified-reusable-components";
import { ListManagerContext } from "./ListManagerContext";
import { CustomListData } from "../interfaces";
import { Link } from "react-router";

export interface ListInfoProps {
  list: CustomListData;
  identifier?: string;
  deleteCustomList: (list: CustomListData) => Promise<void>;
  library: string;
}

export default function ListInfo({
  list,
  identifier,
  deleteCustomList,
  library,
}: ListInfoProps) {
  const admin = React.useContext(ListManagerContext);
  const isActive = identifier === list.id.toString();
  const { id, name, entry_count } = list;
  return (
    <li key={id} className={isActive ? "active" : ""}>
      <div className="custom-list-info">
        <p>{name}</p>
        <p>Books in list: {entry_count}</p>
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
}
