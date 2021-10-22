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
  collections?: AdminCollectionData[];
  entryCount?: string;
  entryPoints?: string[];
  isFetchingMoreCustomListEntries: boolean;
  isFetchingMoreSearchResults: boolean;
  languages: LanguagesData;
  library: LibraryData;
  list?: CollectionData;
  listCollections?: AdminCollectionData[];
  listId?: string | number;
  searchResults?: CollectionData;
  startingTitle?: string;
  draftTitle?: string;
  draftEntries?: Entry[];
  draftCollections?: AdminCollectionData[];
  loadMoreEntries: (url: string) => Promise<CollectionData>;
  loadMoreSearchResults: (url: string) => Promise<CollectionData>;
  search: (url: string) => Promise<CollectionData>;
  setDeletedListEntries: (entries: Entry[]) => void;
  setDraftCollections: (collections) => void;
  setDraftEntries: (entries: Entry[]) => void;
}

export default function CustomListEditorBody({
  collections,
  entryCount,
  entryPoints,
  isFetchingMoreCustomListEntries,
  isFetchingMoreSearchResults,
  languages,
  library,
  list,
  listId,
  searchResults,
  startingTitle,
  draftTitle,
  draftEntries,
  draftCollections,
  loadMoreEntries,
  loadMoreSearchResults,
  search,
  setDeletedListEntries,
  setDraftCollections,
  setDraftEntries,
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
          onChange={(e) => setEntryPointSelected(e.target.value)}
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

  const changeEntries = (entries: Entry[], deletedEntries: Entry[]) => {
    setDraftEntries(entries);
    setDeletedListEntries(deletedEntries);
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
        searchResults={searchResults}
        entries={draftEntries}
        nextPageUrl={list && list.nextPageUrl}
        loadMoreSearchResults={loadMoreSearchResults}
        loadMoreEntries={loadMoreEntries}
        onUpdate={changeEntries}
        isFetchingMoreSearchResults={isFetchingMoreSearchResults}
        isFetchingMoreCustomListEntries={isFetchingMoreCustomListEntries}
        opdsFeedUrl={opdsFeedUrl}
        entryCount={entryCount}
        listId={listId}
      />
    </div>
  );
}
