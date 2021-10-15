import * as React from "react";
import {
  LanguagesData,
  LibraryData,
  CollectionData as AdminCollectionData,
} from "../interfaces";
import { CollectionData } from "opds-web-client/lib/interfaces";
import CustomListEditorHeader from "./CustomListEditorHeader";
import CustomListEditorBody from "./CustomListEditorBody";
import { Entry } from "./CustomListEntriesEditor";
export interface CustomListEditorProps {
  languages: LanguagesData;
  library: LibraryData;
  list?: CollectionData;
  listId?: string | number;
  listCollections?: AdminCollectionData[];
  collections?: AdminCollectionData[];
  responseBody?: string;
  searchResults?: CollectionData;
  editCustomList: (data: FormData, listId?: string) => Promise<void>;
  search: (url: string) => Promise<CollectionData>;
  loadMoreSearchResults: (url: string) => Promise<CollectionData>;
  loadMoreEntries: (url: string) => Promise<CollectionData>;
  isFetchingMoreSearchResults: boolean;
  isFetchingMoreCustomListEntries: boolean;
  entryPoints?: string[];
  entryCount?: string;
  startingTitle?: string;
}

export default function CustomListEditor({
  languages,
  library,
  list,
  listId,
  listCollections,
  collections,
  responseBody,
  searchResults,
  editCustomList,
  search,
  loadMoreSearchResults,
  loadMoreEntries,
  isFetchingMoreSearchResults,
  isFetchingMoreCustomListEntries,
  entryPoints,
  entryCount,
  startingTitle,
}: CustomListEditorProps) {
  const [draftTitle, setDraftTitle] = React.useState<string>("");
  const [draftEntries, setDraftEntries] = React.useState<Entry[]>([]);
  const [deletedListEntries, setDeletedListEntries] = React.useState<Entry[]>(
    []
  );
  const [showSaveError, setShowSaveError] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (list) {
      setDraftTitle(list.title);
      setDraftEntries(list.books);
    } else {
      /** If the list is new, set the draft state to empty. */
      setDraftTitle("");
      setDraftEntries([]);
    }
  }, [list]);

  const saveFormData = () => {
    if (!draftTitle || !draftEntries.length) {
      setShowSaveError(true);
    } else {
      setShowSaveError(false);
      const data = new (window as any).FormData();
      if (list) {
        data.append("id", listId);
      }
      data.append("name", draftTitle);
      data.append("entries", JSON.stringify(draftEntries));
      data.append("deletedEntries", JSON.stringify(deletedListEntries));
      //   data.append("collections", JSON.stringify(collections));

      editCustomList(data, listId && String(listId));
    }
  };

  React.useEffect(() => {
    if (!list && responseBody) {
      window.location.href =
        "/admin/web/lists/" + library.short_name + "/edit/" + responseBody;
    }
  }, [responseBody]);

  /** hasListInfoChanged checks whether the user has updated the
   * list's title, collections, or entries to determine whether the
   * "Save this list" button should be enabled or not. */
  const hasListInfoChanged = (): boolean => {
    const titleChanged = list ? draftTitle !== list.title : draftTitle !== "";
    if (titleChanged) {
      return true;
    }
    if ((list && list.books.length) !== draftEntries.length) {
      return true;
    } else {
      const propsIds = ((list && list.books) || [])
        .map((entry) => entry.id)
        .sort();
      const stateIds = draftEntries?.map((entry) => entry.id).sort();
      for (let i = 0; i < propsIds.length; i++) {
        if (propsIds[i] !== stateIds[i]) {
          return true;
        }
      }
    }
    return false;
  };

  return (
    <div className="custom-list-editor">
      {showSaveError && (
        <p style={{ color: "#d13439" }}>
          To be saved, a list must have a title and contain books.
        </p>
      )}
      <CustomListEditorHeader
        draftTitle={draftTitle}
        list={list}
        setDraftTitle={setDraftTitle}
        setDraftEntries={setDraftEntries}
        listId={listId && listId}
        saveFormData={saveFormData}
        hasListInfoChanged={hasListInfoChanged()}
        listEntries={draftEntries}
      />
      <CustomListEditorBody
        collections={collections}
        entryCount={entryCount}
        entryPoints={entryPoints}
        isFetchingMoreCustomListEntries={isFetchingMoreCustomListEntries}
        isFetchingMoreSearchResults={isFetchingMoreSearchResults}
        languages={languages}
        library={library}
        list={list}
        listId={listId}
        searchResults={searchResults}
        startingTitle={startingTitle}
        draftTitle={draftTitle}
        loadMoreEntries={loadMoreEntries}
        loadMoreSearchResults={loadMoreSearchResults}
        search={search}
        setDeletedListEntries={setDeletedListEntries}
        setDraftEntries={setDraftEntries}
        draftEntries={draftEntries}
      />
    </div>
  );
}
