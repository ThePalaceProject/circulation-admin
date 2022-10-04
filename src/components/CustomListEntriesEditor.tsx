import * as React from "react";
import { Button } from "library-simplified-reusable-components";
import CatalogLink from "opds-web-client/lib/components/CatalogLink";
import { CollectionData } from "opds-web-client/lib/interfaces";
import { getMedium, getMediumSVG } from "opds-web-client/lib/utils/book";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Entry } from "../reducers/customListEditor";
import ApplyIcon from "./icons/ApplyIcon";
import TrashIcon from "./icons/TrashIcon";
import GrabIcon from "./icons/GrabIcon";
import AddIcon from "./icons/AddIcon";
import RefreshIcon from "./icons/RefreshIcon";
import ListLoadingIndicator from "./ListLoadingIndicator";
import LoadButton from "./LoadButton";

export interface CustomListEntriesEditorProps {
  autoUpdate?: boolean;
  autoUpdateStatus?: string;
  entries?: Entry[];
  entryCount?: number;
  isFetchingMoreCustomListEntries: boolean;
  isFetchingSearchResults: boolean;
  isFetchingMoreSearchResults: boolean;
  isOwner?: boolean;
  isSearchModified?: boolean;
  listId?: string | number;
  opdsFeedUrl?: string;
  searchResults?: CollectionData;
  addAllEntries?: () => void;
  addEntry?: (id: string) => void;
  deleteAllEntries?: () => void;
  deleteEntry?: (id: string) => void;
  loadMoreEntries: () => void;
  loadMoreSearchResults: () => void;
  refreshResults?: () => void;
}

const renderCatalogLink = (book, opdsFeedUrl?) => {
  const { title, url } = book;

  if (!url) {
    return null;
  }

  return (
    <CatalogLink
      collectionUrl={opdsFeedUrl}
      bookUrl={url}
      title={title}
      target="_blank"
      className="btn inverted left-align small top-align"
    >
      View details
    </CatalogLink>
  );
};

const CustomListEntriesEditor = ({
  autoUpdate,
  autoUpdateStatus,
  entries = [],
  entryCount = 0,
  isFetchingMoreCustomListEntries,
  isFetchingSearchResults,
  isFetchingMoreSearchResults,
  isOwner,
  isSearchModified,
  listId,
  opdsFeedUrl,
  searchResults,
  addAllEntries,
  addEntry,
  deleteAllEntries,
  deleteEntry,
  loadMoreEntries,
  loadMoreSearchResults,
  refreshResults,
}: CustomListEntriesEditorProps) => {
  const [draggingFrom, setDraggingFrom] = React.useState(null);

  React.useEffect(() => {
    setDraggingFrom(null);
  }, [listId, entries]);

  React.useEffect(() => {
    if (entries) {
      document.getElementById("custom-list-entries-droppable")?.scrollTo(0, 0);
    }
  }, [entries]);

  const filteredSearchResults = React.useMemo(() => {
    if (!searchResults?.books?.length) {
      return [];
    }

    // If the list is auto updating, show all the results.

    if (autoUpdate) {
      return searchResults.books;
    }

    // Otherwise, filter out the results that have already been added to the list.

    const entryIds = entries.reduce((ids, entry) => {
      ids[entry.id] = true;

      return ids;
    }, {});

    return searchResults.books.filter((book) => !entryIds[book.id]);
  }, [autoUpdate, entries, searchResults]);

  const handleDragStart = (event) => {
    setDraggingFrom(event.source.droppableId);

    document.body.classList.add("dragging");
  };

  const handleDragEnd = (event) => {
    const { draggableId, source, destination } = event;

    if (
      source.droppableId === "search-results" &&
      destination?.droppableId === "custom-list-entries"
    ) {
      addEntry?.(draggableId);
    } else if (
      source.droppableId === "custom-list-entries" &&
      destination?.droppableId === "search-results"
    ) {
      deleteEntry?.(draggableId);
    } else {
      setDraggingFrom(null);
    }

    document.body.classList.remove("dragging");
  };

  const readOnly = !isOwner || autoUpdate;

  let searchResultList: JSX.Element | null = null;

  if (isOwner) {
    searchResultList = (
      <div className="custom-list-search-results">
        <div className="droppable-header">
          <h4>Search Results</h4>

          <Button
            aria-label="Refresh"
            className="refresh-button inverted"
            callback={refreshResults}
            content={<RefreshIcon />}
            disabled={isFetchingSearchResults}
          />

          {!readOnly &&
            !isFetchingSearchResults &&
            filteredSearchResults.length > 0 && (
              <Button
                className="add-all-button"
                callback={addAllEntries}
                content={
                  <span>
                    Add all to list
                    <ApplyIcon />
                  </span>
                }
              />
            )}
        </div>

        {isFetchingSearchResults && <ListLoadingIndicator />}

        {!isFetchingSearchResults && (
          <Droppable
            droppableId="search-results"
            isDropDisabled={readOnly || draggingFrom !== "custom-list-entries"}
          >
            {(provided, snapshot) => (
              <ul
                ref={provided.innerRef}
                className={
                  snapshot.isDraggingOver
                    ? "droppable dragging-over"
                    : "droppable"
                }
              >
                {draggingFrom === "custom-list-entries" && (
                  <p>Drag books here to remove them from the list.</p>
                )}

                {draggingFrom !== "custom-list-entries" &&
                  filteredSearchResults.map((book) => (
                    <Draggable
                      key={book.id}
                      draggableId={book.id}
                      isDragDisabled={readOnly}
                    >
                      {(provided, snapshot) => (
                        <li>
                          <div
                            className={
                              "search-result" +
                              (snapshot.isDragging ? " dragging" : "")
                            }
                            ref={provided.innerRef}
                            style={provided.draggableStyle}
                            {...provided.dragHandleProps}
                          >
                            {!readOnly && <GrabIcon />}

                            <div>
                              <div className="title">{book.title}</div>

                              <div className="authors">
                                {book.authors?.join(", ")}
                              </div>
                            </div>

                            {getMediumSVG(getMedium(book))}

                            <div className="links">
                              {renderCatalogLink(book)}

                              {!readOnly && (
                                <Button
                                  callback={() => addEntry?.(book.id)}
                                  className="right-align"
                                  content={
                                    <span>
                                      Add to list
                                      <AddIcon />
                                    </span>
                                  }
                                />
                              )}
                            </div>
                          </div>

                          {provided.placeholder}
                        </li>
                      )}
                    </Draggable>
                  ))}

                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        )}

        {!isFetchingSearchResults && loadMoreSearchResults && (
          <LoadButton
            isFetching={isFetchingMoreSearchResults}
            loadMore={loadMoreSearchResults}
          />
        )}
      </div>
    );
  }

  const visibleEntryCount = entries.length;
  const startNum = visibleEntryCount > 0 ? 1 : 0;
  const endNum = visibleEntryCount;
  const booksText = entryCount === 1 ? "book" : "books";

  const entryListDisplay =
    entryCount > 0
      ? `Displaying ${startNum} - ${endNum} of ${entryCount} ${booksText}`
      : "No books in this list";

  let autoUpdateStatusName = null;
  let autoUpdateStatusDescription = null;

  if (!listId) {
    autoUpdateStatusName = "New";
    autoUpdateStatusDescription =
      "This is a new list. Once the initial search criteria have been saved, the system will begin to populate its entries; however, the list might not be fully populated until the next scheduled update.";
  } else if (isSearchModified) {
    autoUpdateStatusName = "Search criteria modified";
    autoUpdateStatusDescription =
      "There are unsaved changes to the search criteria for this list. Once the changes have been saved, the new search criteria will be used to repopulate the list during the next scheduled update.";
  } else {
    if (autoUpdateStatus === "init") {
      autoUpdateStatusName = "Initializing";
      autoUpdateStatusDescription =
        "This list was created recently. The system has partially populated the list using the configured search criteria and will fully populate the list during the next scheduled update.";
    } else if (autoUpdateStatus === "repopulate") {
      autoUpdateStatusName = "Repopulating";
      autoUpdateStatusDescription =
        "The search criteria for this list were changed recently, but the entries have not yet been updated. The new search criteria will be used to repopulate the list during the next scheduled update.";
    } else if (autoUpdateStatus === "updated") {
      autoUpdateStatusName = "Updated";
      autoUpdateStatusDescription =
        "This list was fully populated during the last scheduled update, using the configured search criteria and the titles that were available at the time. New titles matching the criteria will be added to the list during the next scheduled update.";
    } else if (!autoUpdateStatus) {
      autoUpdateStatusName = "Changing to automatic";
      autoUpdateStatusDescription =
        "This list was populated manually, but is being changed to be updated automatically. The configured search criteria will be used to repopulate the list during the next scheduled update.";
    } else {
      autoUpdateStatusName = autoUpdateStatus;
    }
  }

  const entryList = (
    <div className="custom-list-entries">
      <div className="droppable-header">
        <h4>List Entries: {entryListDisplay}</h4>

        {autoUpdate && (
          <>
            <div className="auto-update-status-name">
              Status: {autoUpdateStatusName}
            </div>
            <aside className="auto-update-status-desc">
              {autoUpdateStatusDescription}
            </aside>
          </>
        )}

        {!readOnly && entries?.length > 0 && (
          <div>
            <span>Remove all currently visible items from list:</span>

            <Button
              className="danger delete-all-button top-align"
              callback={deleteAllEntries}
              content={
                <span>
                  Delete
                  <TrashIcon />
                </span>
              }
            />
          </div>
        )}
      </div>

      {!readOnly && <p>Drag search results here to add them to the list.</p>}

      <Droppable
        droppableId="custom-list-entries"
        isDropDisabled={readOnly || draggingFrom !== "search-results"}
      >
        {(provided, snapshot) => (
          <ul
            ref={provided.innerRef}
            id="custom-list-entries-droppable"
            className={
              snapshot.isDraggingOver ? " droppable dragging-over" : "droppable"
            }
          >
            {entries?.map((book) => (
              <Draggable
                key={book.id}
                draggableId={book.id}
                isDragDisabled={readOnly}
              >
                {(provided, snapshot) => (
                  <li>
                    <div
                      className={
                        "custom-list-entry" +
                        (snapshot.isDragging ? " dragging" : "")
                      }
                      ref={provided.innerRef}
                      style={provided.draggableStyle}
                      {...provided.dragHandleProps}
                    >
                      {!readOnly && <GrabIcon />}

                      <div>
                        <div className="title">{book.title}</div>

                        <div className="authors">
                          {book.authors?.join(", ")}
                        </div>
                      </div>

                      {getMediumSVG(getMedium(book))}

                      <div className="links">
                        {renderCatalogLink(book, opdsFeedUrl)}

                        {!readOnly && (
                          <Button
                            className="small right-align"
                            callback={() => deleteEntry?.(book.id)}
                            content={
                              <span>
                                Remove from list
                                <TrashIcon />
                              </span>
                            }
                          />
                        )}
                      </div>
                    </div>

                    {provided.placeholder}
                  </li>
                )}
              </Draggable>
            ))}

            {provided.placeholder}
          </ul>
        )}
      </Droppable>

      {loadMoreEntries && (
        <LoadButton
          isFetching={isFetchingMoreCustomListEntries}
          loadMore={loadMoreEntries}
        />
      )}
    </div>
  );

  return (
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="custom-list-drag-and-drop">
        {searchResultList}
        {entryList}
      </div>
    </DragDropContext>
  );
};

export default CustomListEntriesEditor;
