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
  addedListEntries: Entry[];
  deletedListEntries: Entry[];
  entries?: Entry[];
  entryCount?: string;
  isFetchingMoreCustomListEntries: boolean;
  nextPageUrl?: string;
  opdsFeedUrl?: string;
  searchResults?: CollectionData;
  deleteAll: () => void;
  deleteEntry?: (id: string) => void;
  loadMoreEntries: (url: string) => Promise<CollectionData>;
  setLoadedMoreEntries: (clicked: boolean) => void;
  // Including for test purposes
  children?: any;
}

export default function CustomListEntries({
  addedListEntries,
  deletedListEntries,
  entries,
  entryCount,
  isFetchingMoreCustomListEntries,
  nextPageUrl,
  opdsFeedUrl,
  searchResults,
  deleteAll,
  deleteEntry,
  loadMoreEntries,
  setLoadedMoreEntries,
}: CustomListEntriesProps) {
  const [totalVisibleEntries, setTotalVisibleEntries] = React.useState(0);

  React.useEffect(() => {
    entries && setTotalVisibleEntries(entries.length);
  }, [entries]);

  const handleDeleteEntry = (id: string) => {
    deleteEntry(id);
  };

  const handleDeleteAll = () => {
    deleteAll();
  };

  let entryListDisplay = "No books in this list";
  const totalEntriesServer = parseInt(entryCount, 10);
  let displayTotal;
  let entriesCount;
  let booksText;
  /**
   * If the server associates books with this list...
   */
  if (totalEntriesServer) {
    /**
     * And there are visible entries...
     */
    if (totalVisibleEntries) {
      entriesCount =
        totalEntriesServer -
        deletedListEntries.length +
        addedListEntries.length;
      displayTotal = `1 - ${entries.length} of ${entriesCount}`;
      booksText = entriesCount === 1 ? "Book" : "Books";
      entryListDisplay = `Displaying ${displayTotal} ${booksText}`;
    } else if (totalEntriesServer - deletedListEntries.length !== 0) {
      /**
       * There are entries on the server, but none are visible,
       * which means the "Delete all" button was recently clicked.
       * If the number of entries on the server minus the number of
       * deleted entries on the frontend doesn't equal 0, there may
       * be more entries on the backend to tell the user about.
       */
      entriesCount =
        totalEntriesServer > deletedListEntries.length
          ? totalEntriesServer - deletedListEntries.length
          : 0;
      displayTotal = `0 - 0 of ${entriesCount}`;
      booksText = entriesCount === 1 ? "Book" : "Books";
      entryListDisplay = `Displaying ${displayTotal} ${booksText}`;
    }
  } else {
    /**
     * totalEntriesServer is falsey, which means this is a new list
     * a user has begun adding books to.
     */
    if (entries && entries.length) {
      displayTotal = `1 - ${entries.length} of ${entries.length}`;
      booksText = entries.length === 1 ? "Book" : "Books";
      entryListDisplay = `Displaying ${displayTotal} ${booksText}`;
    }
  }

  const onLoadMore = () => {
    if (entries && !isFetchingMoreCustomListEntries) {
      loadMoreEntries(nextPageUrl);
      setLoadedMoreEntries(true);
    }
  };
  return (
    <div className="custom-list-entries">
      <div className="droppable-header">
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
