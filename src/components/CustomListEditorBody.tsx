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
  draftCollections?: AdminCollectionData[];
  entries?: Entry[];
  draftTitle?: string;
  totalListEntries?: number;
  entryPoints?: string[];
  isFetchingMoreCustomListEntries: boolean;
  isFetchingMoreSearchResults: boolean;
  languages: LanguagesData;
  library: LibraryData;
  listId?: string | number;
  nextPageUrl?: string;
  searchResults?: CollectionData;
  showSaveError: boolean;
  startingTitle?: string;
  loadMoreEntries: (url: string) => Promise<CollectionData>;
  loadMoreSearchResults: (url: string) => Promise<CollectionData>;
  saveFormData: (action: string, books: string | Entry[]) => void;
  search: (url: string) => Promise<CollectionData>;
  setDraftCollections: (collections: AdminCollectionData[]) => void;
}

export default function CustomListEditorBody({
  collections,
  draftCollections,
  entries,
  draftTitle,
  totalListEntries,
  entryPoints,
  isFetchingMoreCustomListEntries,
  isFetchingMoreSearchResults,
  languages,
  library,
  listId,
  nextPageUrl,
  searchResults,
  showSaveError,
  startingTitle,
  saveFormData,
  loadMoreEntries,
  loadMoreSearchResults,
  search,
  setDraftCollections,
}: CustomListEditorBodyProps) {
  const hasCollection = (collection: AdminCollectionData) => {
    for (const listCollection of draftCollections) {
      if (listCollection.id === collection.id) {
        return true;
      }
    }
    return false;
  };

  const changeCollection = (collection: AdminCollectionData) => {
    let newCollections;
    if (hasCollection(collection)) {
      newCollections = draftCollections.filter(
        (listCollection) => listCollection.id !== collection.id
      );
    } else {
      newCollections = draftCollections.slice(0);
      newCollections.push(collection);
    }
    setDraftCollections(newCollections);
  };

  const crawlable = `${draftTitle ? `lists/${draftTitle}/` : ""}crawlable`;
  const opdsFeedUrl = `${library?.short_name}/${crawlable}`;

  return (
    <div className="custom-list-editor-body">
      <section>
        {collections && collections.length > 0 && (
          <div className="custom-list-filters">
            <Panel
              headerText="Add from collections"
              id="add-from-collections"
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
                      onChange={() => {
                        changeCollection(collection);
                      }}
                    />
                  ))}
                </div>
              }
            />
            <CustomListSearch
              search={search}
              entryPoints={entryPoints}
              startingTitle={startingTitle}
              library={library}
              languages={languages}
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
        totalListEntries={totalListEntries}
        showSaveError={showSaveError}
      />
    </div>
  );
}
