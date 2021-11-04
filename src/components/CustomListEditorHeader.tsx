import * as React from "react";
import TextWithEditMode from "./TextWithEditMode";
import { Button } from "library-simplified-reusable-components";
import { Entry } from "./CustomListEntriesEditor";

export interface CustomListEditorHeaderProps {
  draftTitle: string;
  listId?: string | number;
  hasListInfoChanged: boolean;
  listEntries: Entry[];
  cancelClicked: () => void;
  setDraftTitle: (title) => void;
  saveFormData: () => void;
}

export default function CustomListEditorHeader({
  draftTitle,
  listId,
  hasListInfoChanged,
  setDraftTitle,
  cancelClicked,
  saveFormData,
  listEntries,
}: CustomListEditorHeaderProps) {
  const titleOrEntriesIsBlank = (): boolean => {
    if (
      draftTitle === "" ||
      draftTitle === "list title" ||
      !listEntries.length
    ) {
      return true;
    }
    return false;
  };

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
      <div className="save-or-cancel-list">
        <Button
          callback={saveFormData}
          disabled={titleOrEntriesIsBlank() || !hasListInfoChanged}
          content="Save this list"
        />
        <Button
          className="inverted"
          callback={cancelClicked}
          disabled={!hasListInfoChanged}
          content="Cancel Changes"
        />
      </div>
    </div>
  );
}
