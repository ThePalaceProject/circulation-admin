import * as React from "react";
import { DragDropContext } from "react-beautiful-dnd";
import { CollectionData, BookData } from "opds-web-client/lib/interfaces";
import CustomListSearchResults from "./CustomListSearchResults";
import CustomListEntries from "./CustomListEntries";
export interface Entry extends BookData {
  medium?: string;
}

export interface CustomListEntriesEditorProps {
  addedListEntries?: Entry[];
  deletedListEntries?: Entry[];
  entries?: Entry[];
  entryCount?: string;
  isFetchingMoreCustomListEntries: boolean;
  isFetchingMoreSearchResults: boolean;
  nextPageUrl?: string;
  opdsFeedUrl?: string;
  searchResults?: CollectionData;
  addAll: (resultsToAdd: Entry[]) => void;
  addEntry: (id: string) => void;
  deleteAll: () => void;
  deleteEntry: (id: string) => void;
  loadMoreEntries: (url: string) => Promise<CollectionData>;
  loadMoreSearchResults: (url: string) => Promise<CollectionData>;
  setLoadedMoreEntries: (clicked: boolean) => void;
}

export default function CustomListEntriesEditor({
  addedListEntries,
  deletedListEntries,
  entries,
  entryCount,
  isFetchingMoreCustomListEntries,
  isFetchingMoreSearchResults,
  nextPageUrl,
  opdsFeedUrl,
  searchResults,
  addAll,
  addEntry,
  deleteAll,
  deleteEntry,
  loadMoreEntries,
  loadMoreSearchResults,
  setLoadedMoreEntries,
}: CustomListEntriesEditorProps): JSX.Element {
  const [draggingFrom, setDraggingFrom] = React.useState(null);

  const onDragStart = (initial) => {
    document.body.classList.add("dragging");
    const { source } = initial;
    setDraggingFrom(source.droppableId);
  };

  const onDragEnd = (result) => {
    const { draggableId, source, destination } = result;

    if (
      source.droppableId === "search-results" &&
      destination &&
      destination.droppableId === "custom-list-entries"
    ) {
      addEntry(draggableId);
    } else if (
      source.droppableId === "custom-list-entries" &&
      destination &&
      destination.droppableId === "search-results"
    ) {
      deleteEntry(draggableId);
    } else {
      setDraggingFrom(null);
    }
    document.body.classList.remove("dragging");
  };

  return (
    <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className="custom-list-drag-and-drop">
        <CustomListSearchResults
          entries={entries}
          searchResults={searchResults}
          draggingFrom={draggingFrom}
          opdsFeedUrl={opdsFeedUrl}
          isFetchingMoreSearchResults={isFetchingMoreSearchResults}
          addEntry={addEntry}
          addAll={addAll}
          setDraggingFrom={setDraggingFrom}
          loadMoreSearchResults={loadMoreSearchResults}
        />
        <CustomListEntries
          entryCount={entryCount}
          entries={entries}
          deleteEntry={deleteEntry}
          deleteAll={deleteAll}
          deletedListEntries={deletedListEntries}
          draggingFrom={draggingFrom}
          addedListEntries={addedListEntries}
          opdsFeedUrl={opdsFeedUrl}
          setDraggingFrom={setDraggingFrom}
          isFetchingMoreCustomListEntries={isFetchingMoreCustomListEntries}
          nextPageUrl={nextPageUrl}
          loadMoreEntries={loadMoreEntries}
          setLoadedMoreEntries={setLoadedMoreEntries}
        />
      </div>
    </DragDropContext>
  );
}
