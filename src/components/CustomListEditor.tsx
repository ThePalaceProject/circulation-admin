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
import ShareButton from "./ShareButton";
import TextWithEditMode from "./TextWithEditMode";
import ShareIcon from "./icons/ShareIcon";

type CustomListEditorProps = {
  collections?: AdminCollectionData[];
  entries?: CustomListEditorEntriesData;
  entryPoints?: string[];
  isAutoUpdateEnabled?: boolean;
  isFetchingMoreCustomListEntries: boolean;
  isFetchingSearchResults: boolean;
  isFetchingMoreSearchResults: boolean;
  isLoaded?: boolean;
  isModified?: boolean;
  isOwner?: boolean;
  isShared?: boolean;
  isSharePending?: boolean;
  isValid?: boolean;
  languages: LanguagesData;
  library: LibraryData;
  listId?: string;
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
  share?: () => Promise<void>;
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
  isAutoUpdateEnabled,
  isFetchingMoreCustomListEntries,
  isFetchingSearchResults,
  isFetchingMoreSearchResults,
  isLoaded,
  isModified,
  isOwner,
  isShared,
  isSharePending,
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
  share,
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

  // Automatically execute the search when the list being edited changes, or finishes loading
  // (which means a stored query may have been loaded).

  React.useEffect(() => {
    search?.();
  }, [listId, isLoaded]);

  const readOnly = !isOwner;

  return (
    <div className="custom-list-editor">
      <div className="custom-list-editor-header">
        <div className="edit-custom-list-title">
          {readOnly && <h3>{name}</h3>}

          {!readOnly && (
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
          )}

          {listId && <h4>ID-{listId}</h4>}
        </div>

        {!readOnly && (
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
              content="Cancel changes"
            />
          </div>
        )}
      </div>

      <div className="custom-list-editor-body">
        <section>
          {listId && (
            <Panel
              headerText="Sharing"
              id="sharing"
              content={
                isOwner ? (
                  <div className="sharing-info">
                    <p className="sharing-status">
                      {isShared ? "Shared " : "Not shared"}
                      {isShared && <ShareIcon />}
                    </p>
                    <p>
                      {isShared
                        ? "This list has been shared with other libraries."
                        : "This list can be shared with the other libraries that are currently configured in this Collection Manager."}{" "}
                      A shared list may be edited only by the owning library.
                      Each library that is subscribed to a shared list will
                      obtain only the titles that are available to that library.
                    </p>

                    <p>
                      <i>Once shared, a list cannot be unshared or deleted.</i>
                    </p>

                    {isShared && (
                      <p>
                        Sharing this list again will make it available to any
                        libraries that have been registered in this Collection
                        Manager since the list was last shared.
                      </p>
                    )}

                    <ShareButton
                      disabled={isSharePending}
                      pending={isSharePending}
                      submit={share}
                      text={isShared ? "Share again" : "Share"}
                    />
                  </div>
                ) : (
                  <div className="sharing-info">
                    <p className="sharing-status">
                      <ShareIcon /> Subscribed
                    </p>
                    <p>
                      This list has been shared by another library. It may be
                      edited only by the owning library. Only the titles in the
                      shared list that are available to this library will be
                      obtained.
                    </p>
                  </div>
                )
              }
            />
          )}

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
                        disabled={readOnly}
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
            autoUpdate={properties.autoUpdate}
            isOwner={isOwner}
            searchParams={searchParams}
            updateAutoUpdate={(value) => updateProperty?.("autoUpdate", value)}
            updateSearchParam={updateSearchParam}
            search={search}
            entryPoints={entryPoints}
            startingTitle={startingTitle}
            library={library}
            languages={languages}
            showAutoUpdate={isAutoUpdateEnabled}
            addAdvSearchQuery={addAdvSearchQuery}
            updateAdvSearchQueryBoolean={updateAdvSearchQueryBoolean}
            moveAdvSearchQuery={moveAdvSearchQuery}
            removeAdvSearchQuery={removeAdvSearchQuery}
            selectAdvSearchQuery={selectAdvSearchQuery}
          />
        </section>

        <CustomListEntriesEditor
          autoUpdate={properties.autoUpdate}
          isOwner={isOwner}
          searchResults={searchResults}
          entries={entries.current}
          loadMoreSearchResults={loadMoreSearchResults}
          loadMoreEntries={loadMoreEntries}
          isFetchingSearchResults={isFetchingSearchResults}
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
          refreshResults={search}
        />
      </div>
    </div>
  );
}
