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
import CustomListEntriesEditor, { Entry } from "./CustomListEntriesEditor";

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
  const [entryPointSelected, setEntryPointSelected] = React.useState<string>(
    "all"
  );

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

  const getEntryPointsElms = (entryPoints) => {
    const entryPointsElms = [];
    !entryPoints.includes("All") &&
      entryPointsElms.push(
        <EditableInput
          key="all"
          type="radio"
          name="entry-points-selection"
          checked={"all" === entryPointSelected}
          label="All"
          value="all"
          onChange={() => setEntryPointSelected("all")}
        />
      );
    entryPoints.forEach((entryPoint) =>
      entryPointsElms.push(
        <EditableInput
          key={entryPoint}
          type="radio"
          name="entry-points-selection"
          checked={
            entryPoint === entryPointSelected ||
            entryPoint.toLowerCase() === entryPointSelected
          }
          label={entryPoint}
          value={entryPoint}
          onChange={() => setEntryPointSelected(entryPoint)}
        />
      )
    );
    return entryPointsElms;
  };

  const getSearchQueries = (sortBy: string, language: string) => {
    let query = "";
    if (entryPointSelected && entryPointSelected !== "all") {
      query += `&entrypoint=${encodeURIComponent(entryPointSelected)}`;
    }
    sortBy && (query += `&order=${encodeURIComponent(sortBy)}`);
    language && (query += `&language=${[language]}`);
    return query;
  };

  const executeSearch = (
    searchTerms: string,
    sortBy: string,
    language: string
  ) => {
    const searchQueries = getSearchQueries(sortBy, language);
    const url = `/${library.short_name}/search?q=${searchTerms}${searchQueries}`;
    search(url);
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
              search={executeSearch}
              entryPoints={entryPoints}
              getEntryPointsElms={getEntryPointsElms}
              startingTitle={startingTitle}
              library={library}
              languages={languages}
            />
          </div>
        )}
      </section>
      <CustomListEntriesEditor
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
