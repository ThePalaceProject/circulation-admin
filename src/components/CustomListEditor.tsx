import * as React from "react";
import {
  LanguagesData,
  LibraryData,
  CollectionData as AdminCollectionData,
} from "../interfaces";
import { CollectionData } from "opds-web-client/lib/interfaces";
import CustomListEditorHeader from "./CustomListEditorHeader";
import CustomListEditorBody from "./CustomListEditorBody";
import { Entry } from "./CustomListBuilder";
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
  const [draftCollections, setDraftCollections] = React.useState<
    AdminCollectionData[]
  >([]);
  /**
   * draftEntries is an array of recently added entries.
   * These entries have been saved to the server,
   * but the list has not been fetched since. We need a
   * draftEntries array to display these newly added books
   * to the user.
   */
  const [draftEntries, setDraftEntries] = React.useState<Entry[]>([]);
  /**
   * totalListEntries references the total number of entries in the list.
   * This includes all the currently displayed entries, plus any additional
   * entries on the server.
   */
  const [totalListEntries, setTotalListEntries] = React.useState<number>(0);

  const [showSaveError, setShowSaveError] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (list) {
      setDraftTitle(list.title);
      setDraftCollections(listCollections);
      setDraftEntries(list.books);
    } else {
      /**
       * If the list is new, set the draft state to empty.
       */
      setDraftTitle("");
      setDraftCollections([]);
      setDraftEntries([]);
    }
    setTotalListEntries(entryCount ? parseInt(entryCount, 10) : 0);
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

  const saveFormData = (action, books) => {
    if (!draftTitle) {
      setShowSaveError(true);
      return;
    }
    setShowSaveError(false);
    let itemsToAdd;
    let itemsToDelete;
    if (action === "add") {
      itemsToDelete = [];
      if (typeof books === "string") {
        for (const result of searchResults.books) {
          if (result.id === books) {
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
        setDraftEntries((prevState) => [...itemsToAdd, ...prevState]);
        setTotalListEntries((prevState) => prevState + 1);
      } else {
        itemsToAdd = [];
        for (const result of books) {
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
        setDraftEntries((prevState) => [...itemsToAdd, ...prevState]);
        setTotalListEntries((prevState) => prevState + itemsToAdd.length);
      }
    } else {
      itemsToAdd = [];
      if (typeof books === "string") {
        itemsToDelete = list.books.filter((entry) => entry.id === books);
        setDraftEntries((prevState) =>
          prevState.filter((entry) => entry.id !== books)
        );
        setTotalListEntries((prevState) => prevState - 1);
      } else {
        itemsToDelete = [];
        draftEntries.forEach((book) => itemsToDelete.push(book));
        setDraftEntries([]);
        setTotalListEntries((prevState) => prevState - itemsToDelete.length);
      }
    }
    const data = new (window as any).FormData();
    if (list) {
      data.append("id", listId);
    }
    data.append("name", draftTitle);
    data.append("entries", JSON.stringify(itemsToAdd));
    data.append("deletedEntries", JSON.stringify(itemsToDelete));
    const collections = draftCollections.map((collection) => collection.id);
    data.append("collections", JSON.stringify(collections));

    editCustomList(data, listId && String(listId));
  };

  return (
    <div className="custom-list-editor">
      <CustomListEditorHeader
        draftTitle={draftTitle}
        setDraftTitle={setDraftTitle}
        listId={listId && listId}
      />
      <CustomListEditorBody
        collections={collections}
        totalListEntries={totalListEntries}
        entryPoints={entryPoints}
        entries={draftEntries}
        isFetchingMoreCustomListEntries={isFetchingMoreCustomListEntries}
        isFetchingMoreSearchResults={isFetchingMoreSearchResults}
        languages={languages}
        library={library}
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
        setDraftCollections={setDraftCollections}
        draftCollections={draftCollections}
      />
    </div>
  );
}
