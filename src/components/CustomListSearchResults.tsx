import * as React from "react";
import { Droppable, Draggable } from "react-beautiful-dnd";
import { CollectionData, BookData } from "opds-web-client/lib/interfaces";
import LoadButton from "./LoadButton";
import ApplyIcon from "./icons/ApplyIcon";
import GrabIcon from "./icons/GrabIcon";
import AddIcon from "./icons/AddIcon";
import { Button } from "library-simplified-reusable-components";
import CatalogLink from "opds-web-client/lib/components/CatalogLink";
import { getMedium, getMediumSVG } from "opds-web-client/lib/utils/book";

export interface Entry extends BookData {
  medium?: string;
}

export interface CustomListSearchResultsProps {
  draggingFrom: string | null;
  entries?: Entry[];
  isFetchingMoreSearchResults: boolean;
  opdsFeedUrl?: string;
  searchResults?: CollectionData;
  addAll: (resultsToAdd: Entry[]) => void;
  addEntry?: (id: string) => void;
  loadMoreSearchResults: (url: string) => Promise<CollectionData>;
  setDraggingFrom: (className: string | null) => void;
}

export default function CustomListSearchResults({
  draggingFrom,
  entries,
  isFetchingMoreSearchResults,
  opdsFeedUrl,
  searchResults,
  addAll,
  addEntry,
  loadMoreSearchResults,
  setDraggingFrom,
}: CustomListSearchResultsProps) {
  const searchResultsNotInEntries = () => {
    const entryIds =
      entries && entries.length ? entries.map((entry) => entry.id) : [];
    const resultsNotInEntries =
      searchResults.books && searchResults.books.length
        ? searchResults.books.filter((book) => {
            for (const entryId of entryIds) {
              if (entryId === book.id) {
                return false;
              }
            }
            return true;
          })
        : [];
    return resultsNotInEntries;
  };

  const handleAddEntry = (id) => {
    addEntry(id);
    setDraggingFrom(null);
  };

  const handleAddAll = () => {
    const resultsToAdd = searchResultsNotInEntries();
    addAll(resultsToAdd);
    setDraggingFrom(null);
  };

  const resultsToDisplay = searchResults && searchResultsNotInEntries();

  const loadMore = () => {
    if (searchResults && !isFetchingMoreSearchResults) {
      loadMoreSearchResults(searchResults.nextPageUrl);
    }
  };

  return (
    <div className="custom-list-search-results">
      <div className="droppable-header">
        <h4>Search Results</h4>
        {searchResults && resultsToDisplay.length > 0 && (
          <Button
            key="addAll"
            className="add-all-button"
            callback={handleAddAll}
            content={
              <span>
                Add all to list
                <ApplyIcon />
              </span>
            }
          />
        )}
      </div>
      <Droppable
        droppableId="search-results"
        isDropDisabled={draggingFrom !== "custom-list-entries"}
      >
        {(provided, snapshot) => (
          <ul
            ref={provided.innerRef}
            className={
              snapshot.isDraggingOver ? "droppable dragging-over" : "droppable"
            }
          >
            {draggingFrom === "custom-list-entries" && (
              <p>Drag books here to remove them from the list.</p>
            )}
            {draggingFrom !== "custom-list-entries" &&
              searchResults &&
              resultsToDisplay.map((book) => (
                <Draggable key={book.id} draggableId={book.id}>
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
                        <GrabIcon />
                        <div>
                          <div className="title">{book.title}</div>
                          <div className="authors">
                            {book.authors.join(", ")}
                          </div>
                        </div>
                        {getMediumSVG(getMedium(book))}
                        <div className="links">
                          {book.url && (
                            <CatalogLink
                              collectionUrl={opdsFeedUrl}
                              bookUrl={book.url}
                              title={book.title}
                              target="_blank"
                              className="btn inverted left-align small top-align"
                            >
                              View details
                            </CatalogLink>
                          )}
                          <Button
                            callback={() => {
                              handleAddEntry(book.id);
                            }}
                            className="right-align"
                            content={
                              <span>
                                Add to list
                                <AddIcon />
                              </span>
                            }
                          />
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
      {searchResults && searchResults.nextPageUrl && (
        <LoadButton
          isFetching={isFetchingMoreSearchResults}
          loadMore={loadMore}
        />
      )}
    </div>
  );
}
