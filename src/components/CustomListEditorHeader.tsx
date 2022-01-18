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
  saveFormData: (action: string, data?: string | Entry[]) => void;
  setDraftTitle: (title: string) => void;
}

export default function CustomListEditorHeader({
  draftTitle,
  listId,
  setDraftTitle,
  saveFormData,
}: CustomListEditorHeaderProps) {
  const { setTitleInContext } = React.useContext(ListManagerContext);

  const setNewTitleOnState = (newTitle) => {
    setDraftTitle(newTitle);
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
      saveFormData("saveTitle");
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
