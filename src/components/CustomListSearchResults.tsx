import * as React from "react";
import { Droppable } from "react-beautiful-dnd";
import { CollectionData, BookData } from "opds-web-client/lib/interfaces";
import LoadButton from "./LoadButton";
import ApplyIcon from "./icons/ApplyIcon";
import { Button } from "library-simplified-reusable-components";
import CustomListBookCard from "./CustomListBookCard";

export interface Entry extends BookData {
  medium?: string;
}
export interface CustomListSearchResultsProps {
  entries?: Entry[];
  isFetchingMoreSearchResults: boolean;
  opdsFeedUrl?: string;
  searchResults?: CollectionData;
  saveFormData: (action: string, books: string | Entry[]) => void;
  loadMoreSearchResults: (url: string) => Promise<CollectionData>;
  // Including for test purposes
  children?: any;
}

export default function CustomListSearchResults({
  entries,
  isFetchingMoreSearchResults,
  opdsFeedUrl,
  searchResults,
  saveFormData,
  loadMoreSearchResults,
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

  const handleAddEntry = (id: string) => {
    saveFormData("add", id);
  };

  const handleAddAll = () => {
    const resultsToAdd = searchResultsNotInEntries();
    saveFormData("add", resultsToAdd);
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
          <div>
            <span>Add all currently visible items from list:</span>
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
          </div>
        )}
      </div>
      {entries && <p>Drag books here to remove them from the list.</p>}
      <Droppable droppableId="search-results">
        {(provided, snapshot) => (
          <ul
            ref={provided.innerRef}
            className={
              snapshot.isDraggingOver ? "droppable dragging-over" : "droppable"
            }
          >
            {searchResults &&
              resultsToDisplay.map((book, index) => (
                <CustomListBookCard
                  key={book.id}
                  index={index}
                  typeOfCard="searchResult"
                  book={book}
                  opdsFeedUrl={opdsFeedUrl}
                  handleAddEntry={handleAddEntry}
                />
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
