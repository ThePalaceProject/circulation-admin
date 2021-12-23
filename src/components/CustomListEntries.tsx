import * as React from "react";
import { Droppable } from "react-beautiful-dnd";
import { CollectionData, BookData } from "opds-web-client/lib/interfaces";
import LoadButton from "./LoadButton";
import TrashIcon from "./icons/TrashIcon";
import { Button } from "library-simplified-reusable-components";
import CustomListBookCard from "./CustomListBookCard";

export interface Entry extends BookData {
  medium?: string;
}

export interface CustomListEntriesProps {
  draggingFrom: string | null;
  entries?: Entry[];
  entryCount?: number;
  isFetchingMoreCustomListEntries: boolean;
  nextPageUrl?: string;
  opdsFeedUrl?: string;
  showSaveError: boolean;
  saveFormData: (action: string, books?: string | Entry[]) => void;
  loadMoreEntries: (url: string) => Promise<CollectionData>;
  setDraggingFrom: (dragging: string | null) => void;
}

export default function CustomListEntries({
  draggingFrom,
  entries,
  entryCount,
  isFetchingMoreCustomListEntries,
  nextPageUrl,
  opdsFeedUrl,
  showSaveError,
  saveFormData,
  loadMoreEntries,
  setDraggingFrom,
}: CustomListEntriesProps) {
  const handleDeleteEntry = (id: string) => {
    saveFormData("delete", id);
    setDraggingFrom(null);
  };

  const handleDeleteAll = () => {
    saveFormData("delete");
    setDraggingFrom(null);
  };

  let entryListDisplay = "No books in this list";
  let displayTotal;
  let booksText;

  if (entryCount) {
    displayTotal = `1 - ${entries.length} of ${entryCount}`;
    booksText = entries.length === 1 ? "Book" : "Books";
    entryListDisplay = `Displaying ${displayTotal} ${booksText}`;
  }

  const onLoadMore = () => {
    if (entries && !isFetchingMoreCustomListEntries) {
      loadMoreEntries(nextPageUrl);
    }
  };
  return (
    <div className="custom-list-entries">
      <div className="droppable-header">
        {showSaveError && (
          <p style={{ color: "red" }}>
            Please title this list before adding books.
          </p>
        )}
        <h4>{entryListDisplay}</h4>
        {entries && entries.length > 0 && (
          <div>
            <span>Remove all currently visible items from list:</span>
            <Button
              className="danger delete-all-button top-align"
              callback={handleDeleteAll}
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
      <p>Drag search results here to add them to the list.</p>
      <Droppable
        droppableId="custom-list-entries"
        isDropDisabled={draggingFrom !== "search-results"}
      >
        {(provided, snapshot) => (
          <ul
            ref={provided.innerRef}
            id="custom-list-entries-droppable"
            className={
              snapshot.isDraggingOver ? " droppable dragging-over" : "droppable"
            }
          >
            {entries &&
              entries.map((book) => (
                <CustomListBookCard
                  key={book.id}
                  typeOfCard="entry"
                  book={book}
                  opdsFeedUrl={opdsFeedUrl}
                  handleDeleteEntry={handleDeleteEntry}
                />
              ))}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
      {nextPageUrl && (
        <LoadButton
          isFetching={isFetchingMoreCustomListEntries}
          loadMore={onLoadMore}
        />
      )}
    </div>
  );
}
