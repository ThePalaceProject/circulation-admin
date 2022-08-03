import * as React from "react";
import { Button, Panel } from "library-simplified-reusable-components";
import { CollectionData } from "opds-web-client/lib/interfaces";

import {
  AdvancedSearchQuery,
  LanguagesData,
  LibraryData,
  CollectionData as AdminCollectionData,
} from "../interfaces";

import {
  CustomListEditorProperties,
  CustomListEditorEntriesData,
  CustomListEditorSearchParams,
} from "../reducers/customListEditor";

import CustomListEntriesEditor from "./CustomListEntriesEditor";
import CustomListSearch from "./CustomListSearch";
import EditableInput from "./EditableInput";
import TextWithEditMode from "./TextWithEditMode";

type CustomListEditorProps = {
  collections?: AdminCollectionData[];
  entries?: CustomListEditorEntriesData;
  entryPoints?: string[];
  isFetchingMoreCustomListEntries: boolean;
  isFetchingMoreSearchResults: boolean;
  isModified?: boolean;
  isValid?: boolean;
  languages: LanguagesData;
  library: LibraryData;
  listId?: string | number;
  properties?: CustomListEditorProperties;
  searchParams?: CustomListEditorSearchParams;
  searchResults?: CollectionData;
  startingTitle?: string;
  addAllEntries?: () => void;
  addEntry?: (id: string) => void;
  deleteAllEntries?: () => void;
  deleteEntry?: (id: string) => void;
  loadMoreEntries: () => void;
  loadMoreSearchResults: () => void;
  reset?: () => void;
  save: () => void;
  search: () => void;
  toggleCollection?: (id: number) => void;
  updateProperty?: (name: string, value) => void;
  updateSearchParam?: (name: string, value) => void;
  addAdvSearchQuery?: (builderName: string, query: AdvancedSearchQuery) => void;
  updateAdvSearchQueryBoolean?: (
    builderName: string,
    id: string,
    bool: string
  ) => void;
  moveAdvSearchQuery?: (
    builderName: string,
    id: string,
    targetId: string
  ) => void;
  removeAdvSearchQuery?: (builderName: string, id: string) => void;
  selectAdvSearchQuery?: (builderName: string, id: string) => void;
};

export default function CustomListEditor({
  collections,
  entries,
  entryPoints,
  isFetchingMoreCustomListEntries,
  isFetchingMoreSearchResults,
  isModified,
  isValid,
  languages,
  library,
  listId,
  properties,
  searchParams,
  searchResults,
  startingTitle,
  addAllEntries,
  addEntry,
  deleteAllEntries,
  deleteEntry,
  loadMoreEntries,
  loadMoreSearchResults,
  reset,
  save,
  search,
  toggleCollection,
  updateProperty,
  updateSearchParam,
  addAdvSearchQuery,
  updateAdvSearchQueryBoolean,
  moveAdvSearchQuery,
  removeAdvSearchQuery,
  selectAdvSearchQuery,
}: CustomListEditorProps) {
  const { collections: listCollections, name } = properties;

  return (
    <div className="custom-list-editor">
      <div className="custom-list-editor-header">
        <div className="edit-custom-list-title">
          <fieldset className="save-or-edit">
            <legend className="visuallyHidden">List name</legend>

            <TextWithEditMode
              text={name}
              placeholder="list title"
              onUpdate={(title) => updateProperty?.("name", title)}
              aria-label="Enter a title for this list"
              disableIfBlank={true}
            />
          </fieldset>

          {listId && <h4>ID-{listId}</h4>}
        </div>

        <div className="save-or-cancel-list">
          <Button
            callback={save}
            disabled={!isModified || !isValid}
            content="Save this list"
          />

          <Button
            className="inverted"
            callback={reset}
            disabled={!isModified}
            content="Cancel Changes"
          />
        </div>
      </div>

      <div className="custom-list-editor-body">
        <section>
          {collections?.length > 0 && (
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

                    {collections.map(({ id, name }) => (
                      <EditableInput
                        key={id}
                        type="checkbox"
                        name="collection"
                        checked={listCollections.includes(id)}
                        label={name}
                        value={id}
                        onChange={(id) => toggleCollection?.(parseInt(id))}
                      />
                    ))}
                  </div>
                }
              />
            </div>
          )}

          <CustomListSearch
            searchParams={searchParams}
            updateSearchParam={updateSearchParam}
            search={search}
            entryPoints={entryPoints}
            startingTitle={startingTitle}
            library={library}
            languages={languages}
            addAdvSearchQuery={addAdvSearchQuery}
            updateAdvSearchQueryBoolean={updateAdvSearchQueryBoolean}
            moveAdvSearchQuery={moveAdvSearchQuery}
            removeAdvSearchQuery={removeAdvSearchQuery}
            selectAdvSearchQuery={selectAdvSearchQuery}
          />
        </section>

        <CustomListEntriesEditor
          searchResults={searchResults}
          entries={entries.current}
          loadMoreSearchResults={loadMoreSearchResults}
          loadMoreEntries={loadMoreEntries}
          isFetchingMoreSearchResults={isFetchingMoreSearchResults}
          isFetchingMoreCustomListEntries={isFetchingMoreCustomListEntries}
          opdsFeedUrl={`${library?.short_name}/${
            name ? `lists/${name}/` : ""
          }crawlable`}
          entryCount={entries.currentTotalCount}
          listId={listId}
          addEntry={addEntry}
          addAllEntries={addAllEntries}
          deleteEntry={deleteEntry}
          deleteAllEntries={deleteAllEntries}
        />
      </div>
    </div>
  );
}
