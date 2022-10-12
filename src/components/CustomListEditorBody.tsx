import * as React from "react";
import {
  LanguagesData,
  LibraryData,
  CollectionData as AdminCollectionData,
} from "../interfaces";
import { CollectionData } from "opds-web-client/lib/interfaces";
import { Panel } from "library-simplified-reusable-components";
import EditableInput from "./EditableInput";
import CustomListSearch from "./CustomListSearch";
import CustomListBuilder, { Entry } from "./CustomListBuilder";

export interface CustomListEditorBodyProps {
  collections?: AdminCollectionData[];
  entries?: Entry[];
  draftTitle?: string;
  entryPoints?: string[];
  isFetchingMoreCustomListEntries: boolean;
  isFetchingMoreSearchResults: boolean;
  languages: LanguagesData;
  library: LibraryData;
  listCollections?: AdminCollectionData[];
  listId?: string | number;
  loadMoreEntries: (url: string) => Promise<CollectionData>;
  loadMoreSearchResults: (url: string) => Promise<CollectionData>;
  nextPageUrl?: string;
  saveFormData: (action: string, books: string | Entry[]) => void;
  search: (url: string) => Promise<CollectionData>;
  searchResults?: CollectionData;
  showSaveError: boolean;
  startingTitle?: string;
}

export default function CustomListEditorBody({
  collections,
  entries,
  draftTitle,
  entryPoints,
  isFetchingMoreCustomListEntries,
  isFetchingMoreSearchResults,
  languages,
  library,
  listCollections,
  listId,
  nextPageUrl,
  searchResults,
  showSaveError,
  startingTitle,
  saveFormData,
  loadMoreEntries,
  loadMoreSearchResults,
  search,
}: CustomListEditorBodyProps) {
  const hasCollection = (collection: AdminCollectionData) => {
    if (listCollections) {
      for (const listCollection of listCollections) {
        if (listCollection.id === collection.id) {
          return true;
        }
      }
      return false;
    } else {
      return false;
    }
  };

  const changeCollection = (collection: AdminCollectionData) => {
    let newCollections;
    if (hasCollection(collection)) {
      newCollections = listCollections.filter(
        (listCollection) => listCollection.id !== collection.id
      );
    } else {
      newCollections = listCollections.slice(0);
      newCollections.push(collection);
    }
    saveFormData("changeCollections", newCollections);
  };

  const crawlable = `${draftTitle && `lists/${draftTitle}/`}crawlable`;
  const opdsFeedUrl = `${library?.short_name}/${crawlable}`;

  return (
    <div className="custom-list-editor-body">
      <section>
        {collections && collections.length && (
          <div className="custom-list-filters">
            <Panel
              content={
                <div className="collections">
                  <div>
                    Automatically add new books from these collections to this
                    list:
                  </div>
                  {collections.map((collection) => (
                    <EditableInput
                      key={collection.id}
                      type="checkbox"
                      name="collection"
                      checked={hasCollection(collection)}
                      label={collection.name}
                      value={String(collection.id)}
                      onChange={() => changeCollection(collection)}
                    />
                  ))}
                </div>
              }
              headerText="Add from collections"
              id="add-from-collections"
            />
            <CustomListSearch
              entryPoints={entryPoints}
              languages={languages}
              library={library}
              search={search}
              startingTitle={startingTitle}
            />
          </div>
        )}
      </section>
      <CustomListBuilder
        saveFormData={saveFormData}
        searchResults={searchResults}
        entries={entries}
        nextPageUrl={nextPageUrl}
        listId={listId}
        loadMoreSearchResults={loadMoreSearchResults}
        loadMoreEntries={loadMoreEntries}
        isFetchingMoreSearchResults={isFetchingMoreSearchResults}
        isFetchingMoreCustomListEntries={isFetchingMoreCustomListEntries}
        opdsFeedUrl={opdsFeedUrl}
        showSaveError={showSaveError}
      />
    </div>
  );
}
