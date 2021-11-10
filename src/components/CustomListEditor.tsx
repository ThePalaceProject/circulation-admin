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
import { getMedium } from "opds-web-client/lib/utils/book";
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
  const [addedListEntries, setAddedListEntries] = React.useState<Entry[]>([]);
  const [draftCollections, setDraftCollections] = React.useState<
    AdminCollectionData[]
  >([]);
  const [showSaveError, setShowSaveError] = React.useState<boolean>(false);
  const [loadedMoreEntries, setLoadedMoreEntries] = React.useState<boolean>(
    false
  );

  console.log("deletedListEntries -->", deletedListEntries);
  console.log("addedListEntries -->", addedListEntries);
  console.log("draftEntries -->", draftEntries);

  React.useEffect(() => {
    if (list) {
      setDraftTitle(list.title);
      setDraftEntries(list.books);
      setDraftCollections(listCollections);
    } else {
      /**
       * If the list is new, set the draft state to empty.
       */
      setDraftTitle("");
      setDraftEntries([]);
      setDraftCollections([]);
    }
    /**
     * If the user has clicked the "Load more" button at the base of the entries list...
     */
    if (loadedMoreEntries) {
      /**
       * Check for deleted entries, and remove them from the entire combined list.
       */
      if (deletedListEntries.length) {
        deletedListEntries.forEach((deletedEntry) => {
          list.books.forEach((book, i) => {
            if (book.id === deletedEntry.id) {
              list.books.splice(i, 1);
            }
          });
        });
      }
      /**
       * If there are books in addedListEntries, check them against the incoming entries
       * for any duplicates before adding the titles back in. If there are duplicates, delete
       * them from the addedListEntries array.
       */
      let newAddedListEntries;

      if (addedListEntries.length) {
        newAddedListEntries = addedListEntries.slice();
        list.books.forEach((book) => {
          newAddedListEntries.forEach((entry, j) => {
            if (book.id === entry.id) {
              newAddedListEntries.splice(j, 1);
            }
          });
        });
        setAddedListEntries(newAddedListEntries);
      }
    }
  }, [list]);

  React.useEffect(() => {
    /**
     * If the addedListEntries changed as a result of the setAddedListEntries() above,
     * merge the new list of books with the new added list, and then set the result to draftEntries.
     */
    if (loadedMoreEntries) {
      setDraftEntries(addedListEntries.concat(list.books));
      setLoadedMoreEntries(false);
    }
  }, [addedListEntries]);

  React.useEffect(() => {
    if (!list && responseBody) {
      window.location.href =
        "/admin/web/lists/" + library.short_name + "/edit/" + responseBody;
    }
  }, [responseBody]);

  const getLanguage = (book) => {
    return book.language || "";
  };

  const addEntry = (id: string) => {
    const newEntries = draftEntries.slice();
    let entry;
    /**
     * Loop through the searchResults and find the the book the user wants to add.
     * Then, create a new entry and add it to the beginning of the entries array.
     */
    for (const result of searchResults.books) {
      if (result.id === id) {
        const medium = getMedium(result);
        const language = getLanguage(result);
        entry = {
          id: result.id,
          title: result.title,
          authors: result.authors,
          url: result.url,
          medium,
          language,
        };
        newEntries.unshift(entry);
        setDraftEntries(newEntries);
      }
    }
    /**
     * Create an array containing the added entries, without the most recent added entry.
     */
    const prevAdded = addedListEntries.filter((entry) => entry.id !== id);
    const newAdded = prevAdded.concat(entry);
    setAddedListEntries(newAdded);
    /**
     * Set deleted entries to array containing all except the one being added.
     */
    setDeletedListEntries(
      deletedListEntries.filter((entry) => entry.id !== id)
    );
  };

  const deleteEntry = (id: string) => {
    const newEntries = draftEntries.filter((entry) => entry.id !== id);
    setDraftEntries(newEntries);
    /**
     * Create an array containing just the deletedEntry.
     */
    const deletedEntry = draftEntries.filter((entry) => entry.id === id);
    /**
     * If the book is one from the server, create an array containing the deleted
     * entries, without the most recent deletedEntry. Then, combine the arrays.
     * If the book was just added and is not one from the server, we can remove it
     * from the draftEntries without adding it to the deleted array.
     */
    if (list.books.filter((book) => book.id === id).length) {
      const prevDeleted = deletedListEntries.filter((entry) => entry.id !== id);
      const newDeleted = [...prevDeleted, ...deletedEntry];
      setDeletedListEntries(newDeleted);
    }
    /**
     * Set the "added" value, on state, to a new array without the deletedEntry.
     */
    const newAdded = addedListEntries.filter((entry) => entry.id !== id);
    setAddedListEntries(newAdded);
  };

  const addAll = (resultsToAdd: Entry[]) => {
    const entriesToAdd = [];
    for (const result of resultsToAdd) {
      const medium = getMedium(result);
      const language = getLanguage(result);
      entriesToAdd.push({
        id: result.id,
        title: result.title,
        authors: result.authors,
        url: result.url,
        medium,
        language,
      });
    }
    /**
     * Create an array containing the ids of the existing entries.
     */
    const existingEntriesIds = draftEntries.map((entry) => entry.id);
    /**
     * Create an array containing the ids of the entries being added.
     */
    const newEntriesIds = entriesToAdd.map((entry) => entry.id);
    /**
     * Filter through the entriesToAdd array and remove any book
     * whose id matches an id in the existingEntriesIds array.
     */
    const newlyAdded = entriesToAdd.filter((book) => {
      for (const newEntriesId of existingEntriesIds) {
        if (newEntriesId === book.id) {
          return false;
        }
      }
      return true;
    });
    /**
     * Remove any books from the deletedListEntries that are being added.
     */
    const deleted = deletedListEntries.filter((book) => {
      for (const newEntriesId of newEntriesIds) {
        if (newEntriesId === book.id) {
          return false;
        }
      }
      return true;
    });
    setDeletedListEntries(deleted);
    for (const entry of draftEntries) {
      entriesToAdd.push(entry);
    }
    setDraftEntries(entriesToAdd);
    setAddedListEntries([...addedListEntries, ...newlyAdded]);
  };

  const deleteAll = () => {
    /**
     * Create a copy of the draftEntries.
     */
    const entriesToDelete = draftEntries.slice();

    setDraftEntries([]);
    setDeletedListEntries(deletedListEntries.concat(entriesToDelete));
    setAddedListEntries([]);
  };

  /**
   * Check whether the user has updated the list's title, collections,
   * or entries to determine whether "Save this list" should be enabled or not.
   */
  const hasListInfoChanged = (): boolean => {
    const titleChanged = list ? draftTitle !== list.title : draftTitle !== "";
    if (titleChanged) return true;
    /**
     * Check if list's collections changed by comparing the draft to listCollections
     * if it's an existing list (first checking if length is the same,
     * then checking the ids), or to an empty array if it's a new list.
     */
    if (list && listCollections.length !== draftCollections.length) {
      return true;
    } else {
      const propsIds = ((list && listCollections) || [])
        .map((collection) => collection.id)
        .sort();
      const stateIds = draftCollections
        ?.map((collection) => collection.id)
        .sort();
      for (let i = 0; i < propsIds.length; i++) {
        if (propsIds[i] !== stateIds[i]) {
          return true;
        }
      }
    }
    /**
     * Check if list's entries changed by comparing the draft to list.books
     * if it's an existing list (first checking if length is the same,
     * then checking the ids), or to an empty array if it's a new list.
     */
    if (list && list.books.length !== draftEntries.length) {
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
    /**
     * Check if the number of books the server associates with this list is the
     * same as the number of books the frontend associates with this list.
     */
    const totalEntriesServer = parseInt(entryCount, 10);
    if (
      entryCount &&
      totalEntriesServer !==
        totalEntriesServer - deletedListEntries.length + addedListEntries.length
    )
      return true;

    return false;
  };

  const cancelClicked = (): void => {
    setDraftTitle(list ? list.title : "");
    setDraftEntries(list ? list.books : []);
    setDeletedListEntries([]);
    setAddedListEntries([]);
  };

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
      const collections = draftCollections.map((collection) => collection.id);
      data.append("collections", JSON.stringify(collections));

      editCustomList(data, listId && String(listId));
    }
    setDeletedListEntries([]);
    setAddedListEntries([]);
  };

  return (
    <div className="custom-list-editor">
      {showSaveError && (
        <p className="save-list-error">
          To be saved, a list must have a title and contain books.
        </p>
      )}
      <CustomListEditorHeader
        draftTitle={draftTitle}
        setDraftTitle={setDraftTitle}
        listId={listId && listId}
        saveFormData={saveFormData}
        hasListInfoChanged={hasListInfoChanged()}
        draftEntries={draftEntries}
        cancelClicked={cancelClicked}
      />
      <CustomListEditorBody
        collections={collections}
        entryCount={entryCount}
        entryPoints={entryPoints}
        isFetchingMoreCustomListEntries={isFetchingMoreCustomListEntries}
        isFetchingMoreSearchResults={isFetchingMoreSearchResults}
        languages={languages}
        library={library}
        listId={listId}
        nextPageUrl={list && list.nextPageUrl}
        searchResults={searchResults}
        startingTitle={startingTitle}
        deletedListEntries={deletedListEntries}
        addedListEntries={addedListEntries}
        draftTitle={draftTitle}
        loadMoreEntries={loadMoreEntries}
        loadMoreSearchResults={loadMoreSearchResults}
        search={search}
        addEntry={addEntry}
        deleteEntry={deleteEntry}
        addAll={addAll}
        deleteAll={deleteAll}
        setDraftCollections={setDraftCollections}
        setLoadedMoreEntries={setLoadedMoreEntries}
        draftEntries={draftEntries}
        draftCollections={draftCollections}
      />
    </div>
  );
}
