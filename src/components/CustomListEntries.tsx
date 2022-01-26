import * as React from "react";
import { Droppable } from "react-beautiful-dnd";
import { CollectionData, BookData } from "opds-web-client/lib/interfaces";
import LoadButton from "./LoadButton";
import TrashIcon from "./icons/TrashIcon";
import { Button } from "library-simplified-reusable-components";
import CustomListBookCard from "./CustomListBookCard";
import { ListManagerContext } from "./ListManagerContext";

export interface Entry extends BookData {
  medium?: string;
}

export interface CustomListEntriesProps {
  entries?: Entry[];
  totalListEntries?: number;
  isFetchingMoreCustomListEntries: boolean;
  listId?: string | number;
  nextPageUrl?: string;
  opdsFeedUrl?: string;
  searchResults?: CollectionData;
  showSaveError: boolean;
  saveFormData: (action: string, books?: string | Entry[]) => void;
  loadMoreEntries: (url: string) => Promise<CollectionData>;
  // Including for test purposes
  children?: any;
}

export default function CustomListEntries({
  entries,
  totalListEntries,
  isFetchingMoreCustomListEntries,
  listId,
  nextPageUrl,
  opdsFeedUrl,
  showSaveError,
  saveFormData,
  searchResults,
  loadMoreEntries,
}: CustomListEntriesProps) {
  const handleDeleteEntry = (id: string) => {
    saveFormData("delete", id);
  };

  const handleDeleteAll = () => {
    saveFormData("delete");
  };

  const { entryCountInContext, setEntryCountInContext } = React.useContext(
    ListManagerContext
  );

  const [entryListDisplay, setEntryListDisplay] = React.useState<string>("");

  React.useEffect(() => {
    setEntryCountInContext((prevState) => ({
      ...prevState,
      [listId]: totalListEntries,
    }));
  }, [entries.length]);

  React.useEffect(() => {
    if (totalListEntries) {
      const displayTotal = `1 - ${entries.length} of ${totalListEntries}`;
      const booksText = totalListEntries === 1 ? "Book" : "Books";
      setEntryListDisplay(`Displaying ${displayTotal} ${booksText}`);
    } else {
      setEntryListDisplay("No books in this list");
    }
  }, [totalListEntries, entryCountInContext]);

  const onLoadMore = () => {
    if (entries && !isFetchingMoreCustomListEntries) {
      loadMoreEntries(nextPageUrl);
    }
  };
  return (
    <div className="custom-list-entries">
      <div className="droppable-header">
        {showSaveError && (
          <p className="save-list-error">
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
      {searchResults && (
        <p>Drag search results here to add them to the list.</p>
      )}
      <Droppable droppableId="custom-list-entries">
        {(provided, snapshot) => (
          <ul
            ref={provided.innerRef}
            id="custom-list-entries-droppable"
            className={
              snapshot.isDraggingOver ? " droppable dragging-over" : "droppable"
            }
          >
            {entries &&
              entries.map((book, index) => (
                <CustomListBookCard
                  index={index}
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
