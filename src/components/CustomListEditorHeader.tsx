import * as React from "react";
import TextWithEditMode from "./TextWithEditMode";
import { Entry } from "./CustomListBuilder";

export interface CustomListEditorHeaderProps {
  draftTitle: string;
  listId?: string | number;
  setDraftTitle: (title) => void;
}

export default function CustomListEditorHeader({
  draftTitle,
  listId,
  setDraftTitle,
}: CustomListEditorHeaderProps) {
  const setNewTitleOnState = (newTitle): void => {
    setDraftTitle(newTitle);
  };

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
