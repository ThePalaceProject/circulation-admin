import * as React from "react";
import TextWithEditMode from "./TextWithEditMode";
import { ListManagerContext } from "./ListManagerContext";
import { BookData } from "opds-web-client/lib/interfaces";

export interface Entry extends BookData {
  medium?: string;
}

export interface CustomListEditorHeaderProps {
  draftTitle: string;
  listId?: string | number;
  setDraftTitle: (title: string) => void;
  editCustomList: (data: FormData, listId?: string) => Promise<void>;
}

export default function CustomListEditorHeader({
  draftTitle,
  listId,
  setDraftTitle,
  editCustomList,
}: CustomListEditorHeaderProps) {
  const { setTitleInContext } = React.useContext(ListManagerContext);

  const saveFormTitle = (title: string) => {
    const formData = new (window as any).FormData();
    if (listId) {
      formData.append("id", listId);
    }
    formData.append("name", title);
    formData.append("entries", JSON.stringify([]));
    formData.append("deletedEntries", JSON.stringify([]));
    formData.append("collections", JSON.stringify([]));

    editCustomList(formData, listId && String(listId));
  };

  const setNewTitleOnState = (newTitle) => {
    setDraftTitle(newTitle);
    saveFormTitle(newTitle);
  };

  /**
   *  Add title to context so sidebar's title can be updated as well.
   */
  React.useEffect(() => {
    if (draftTitle) {
      setTitleInContext((prevState) => ({
        ...prevState,
        [listId]: draftTitle,
      }));
    }
  }, [draftTitle]);

  return (
    <div className="custom-list-editor-header">
      <div className="edit-custom-list-title">
        <fieldset className="save-or-edit">
          <legend className="visuallyHidden">List name</legend>
          <TextWithEditMode
            text={draftTitle}
            placeholder="list title"
            onUpdate={setNewTitleOnState}
            aria-label="Enter a title for this list"
            disableIfBlank={true}
          />
        </fieldset>
        {listId && <h4>ID-{listId}</h4>}
      </div>
    </div>
  );
}
