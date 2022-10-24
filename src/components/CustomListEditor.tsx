import * as React from "react";

import {
  LanguagesData,
  LibraryData,
  CollectionData as AdminCollectionData,
} from "../interfaces";
import { CollectionData } from "opds-web-client/lib/interfaces";
import CustomListEditorHeader from "./CustomListEditorHeader";
import CustomListEditorBody from "./CustomListEditorBody";
import { getMedium } from "opds-web-client/lib/utils/book";
import { ListManagerContext } from "./ListManagerContext";

export interface CustomListEditorProps {
  collections?: AdminCollectionData[];
  editCustomList: (data: FormData, listId?: string) => Promise<void>;
  entryCount?: number;
  entryPoints?: string[];
  isFetchingMoreCustomListEntries: boolean;
  isFetchingMoreSearchResults: boolean;
  languages: LanguagesData;
  library: LibraryData;
  list?: CollectionData;
  listCollections?: AdminCollectionData[];
  listId?: string | number;
  loadMoreEntries: (url: string) => Promise<CollectionData>;
  loadMoreSearchResults: (url: string) => Promise<CollectionData>;
  responseBody?: string;
  search: (url: string) => Promise<CollectionData>;
  searchResults?: CollectionData;
  startingTitle?: string;
}

export default function CustomListEditor({
  collections,
  editCustomList,
  entryCount,
  entryPoints,
  isFetchingMoreCustomListEntries,
  isFetchingMoreSearchResults,
  languages,
  library,
  list,
  listCollections,
  listId,
  loadMoreEntries,
  loadMoreSearchResults,
  responseBody,
  search,
  searchResults,
  startingTitle,
}: CustomListEditorProps) {
  const [draftTitle, setDraftTitle] = React.useState<string>("");
  const [showSaveError, setShowSaveError] = React.useState<boolean>(false);

  const { setEntryCountInContext } = React.useContext(ListManagerContext);

  React.useEffect(() => {
    setEntryCountInContext((prevState) => ({
      ...prevState,
      [listId]: entryCount,
    }));
  }, [entryCount]);

  React.useEffect(() => {
    if (list) {
      setDraftTitle(list.title);
    } else {
      // If the list is new, set the draft state to empty.
      setDraftTitle("");
    }
    setShowSaveError(false);
  }, [list]);

  React.useEffect(() => {
    if (!list && responseBody) {
      window.location.href =
        "/admin/web/lists/" + library.short_name + "/edit/" + responseBody;
    }
  }, [responseBody]);

  const getLanguage = (book) => {
    return book.language || "";
  };

  const saveFormData = (action, data?) => {
    if (!draftTitle) {
      setShowSaveError(true);
      return;
    }
    setShowSaveError(false);
    let itemsToAdd = [];
    let itemsToDelete = [];
    // If the user is adding books to a list from the search results...
    if (action === "add") {
      // If it is only one book...
      if (typeof data === "string") {
        for (const result of searchResults.books) {
          if (result.id === data) {
            const medium = getMedium(result);
            const language = getLanguage(result);
            itemsToAdd = [
              {
                id: result.id,
                title: result.title,
                authors: result.authors,
                url: result.url,
                medium,
                language,
              },
            ];
          }
        }
      } else {
        // If the user clicked "Add all to list"...
        for (const result of data) {
          const medium = getMedium(result);
          const language = getLanguage(result);
          itemsToAdd.push({
            id: result.id,
            title: result.title,
            authors: result.authors,
            url: result.url,
            medium,
            language,
          });
        }
      }
      // If the user is deleting books from the list...
    } else if (action === "delete") {
      // If it is only one book...
      if (typeof data === "string") {
        itemsToDelete = list.books.filter((entry) => entry.id === data);
        // If the user clicked "Delete"...
      } else {
        list.books.forEach((book) => itemsToDelete.push(book));
      }
    }
    const formData = new (window as any).FormData();
    if (list) {
      formData.append("id", listId);
    }
    formData.append("name", draftTitle);
    formData.append("entries", JSON.stringify(itemsToAdd));
    formData.append("deletedEntries", JSON.stringify(itemsToDelete));
    const collections =
      action === "changeCollections"
        ? data.map((collection) => collection.id)
        : listCollections.map((collection) => collection.id);
    formData.append("collections", JSON.stringify(collections));

    editCustomList(formData, listId && String(listId));
  };

  return (
    <div className="custom-list-editor">
      <CustomListEditorHeader
        draftTitle={draftTitle}
        editCustomList={editCustomList}
        listId={listId && listId}
        setDraftTitle={setDraftTitle}
      />
      <CustomListEditorBody
        collections={collections}
        entryPoints={entryPoints}
        entries={list ? list.books : []}
        isFetchingMoreCustomListEntries={isFetchingMoreCustomListEntries}
        isFetchingMoreSearchResults={isFetchingMoreSearchResults}
        languages={languages}
        library={library}
        listCollections={listCollections}
        listId={listId}
        nextPageUrl={list && list.nextPageUrl}
        searchResults={searchResults}
        showSaveError={showSaveError}
        startingTitle={startingTitle}
        draftTitle={draftTitle}
        loadMoreEntries={loadMoreEntries}
        loadMoreSearchResults={loadMoreSearchResults}
        saveFormData={saveFormData}
        search={search}
      />
    </div>
  );
}
