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
import { EntryPoint } from "./CustomListSearch";

export interface CustomListEditorBodyProps {
  addedListEntries?: Entry[];
  collections?: AdminCollectionData[];
  deletedListEntries?: Entry[];
  draftCollections?: AdminCollectionData[];
  draftEntries?: Entry[];
  draftTitle?: string;
  entryCount?: string;
  entryPoints?: string[];
  isFetchingMoreCustomListEntries: boolean;
  isFetchingMoreSearchResults: boolean;
  languages: LanguagesData;
  library: LibraryData;
  listId?: string | number;
  nextPageUrl?: string;
  searchResults?: CollectionData;
  startingTitle?: string;
  addAll: (resultsToAdd: Entry[]) => void;
  addEntry: (id: string) => void;
  deleteEntry: (id: string) => void;
  deleteAll: () => void;
  loadMoreEntries: (url: string) => Promise<CollectionData>;
  loadMoreSearchResults: (url: string) => Promise<CollectionData>;
  search: (url: string) => Promise<CollectionData>;
  setDraftCollections: (collections: AdminCollectionData[]) => void;
  setLoadedMoreEntries: (clicked: boolean) => void;
}

export default function CustomListEditorBody({
  addedListEntries,
  collections,
  deletedListEntries,
  draftCollections,
  draftEntries,
  draftTitle,
  entryCount,
  entryPoints,
  isFetchingMoreCustomListEntries,
  isFetchingMoreSearchResults,
  languages,
  library,
  nextPageUrl,
  searchResults,
  startingTitle,
  addAll,
  addEntry,
  deleteAll,
  deleteEntry,
  loadMoreEntries,
  loadMoreSearchResults,
  search,
  setDraftCollections,
  setLoadedMoreEntries,
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
        addEntry={addEntry}
        deleteEntry={deleteEntry}
        addAll={addAll}
        deleteAll={deleteAll}
        searchResults={searchResults}
        entries={draftEntries}
        deletedListEntries={deletedListEntries}
        addedListEntries={addedListEntries}
        nextPageUrl={nextPageUrl}
        loadMoreSearchResults={loadMoreSearchResults}
        loadMoreEntries={loadMoreEntries}
        isFetchingMoreSearchResults={isFetchingMoreSearchResults}
        isFetchingMoreCustomListEntries={isFetchingMoreCustomListEntries}
        opdsFeedUrl={opdsFeedUrl}
        entryCount={entryCount}
        setLoadedMoreEntries={setLoadedMoreEntries}
      />
    </div>
  );
}
