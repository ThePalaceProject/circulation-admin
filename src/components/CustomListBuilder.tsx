import * as React from "react";
import { DragDropContext } from "react-beautiful-dnd";
import { CollectionData, BookData } from "opds-web-client/lib/interfaces";
import CustomListSearchResults from "./CustomListSearchResults";
import CustomListEntries from "./CustomListEntries";
export interface Entry extends BookData {
  medium?: string;
}

export interface CustomListBuilderProps {
  entries?: Entry[];
  totalListEntries?: number;
  isFetchingMoreCustomListEntries: boolean;
  isFetchingMoreSearchResults: boolean;
  listId?: string | number;
  nextPageUrl?: string;
  opdsFeedUrl?: string;
  searchResults?: CollectionData;
  showSaveError: boolean;
  saveFormData: (action: string, books: string | Entry[]) => void;
  loadMoreEntries: (url: string) => Promise<CollectionData>;
  loadMoreSearchResults: (url: string) => Promise<CollectionData>;
}

export default function CustomListBuilder({
  entries,
  totalListEntries,
  isFetchingMoreCustomListEntries,
  isFetchingMoreSearchResults,
  listId,
  nextPageUrl,
  opdsFeedUrl,
  searchResults,
  saveFormData,
  showSaveError,
  loadMoreEntries,
  loadMoreSearchResults,
}: CustomListBuilderProps): JSX.Element {
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
      saveFormData("add", draggableId);
    } else if (
      source.droppableId === "custom-list-entries" &&
      destination &&
      destination.droppableId === "search-results"
    ) {
      saveFormData("delete", draggableId);
    } else {
      setDraggingFrom(null);
    }
    setDraggingFrom(null);
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
          saveFormData={saveFormData}
          loadMoreSearchResults={loadMoreSearchResults}
        />
        <CustomListEntries
          totalListEntries={totalListEntries}
          entries={entries}
          saveFormData={saveFormData}
          draggingFrom={draggingFrom}
          opdsFeedUrl={opdsFeedUrl}
          showSaveError={showSaveError}
          isFetchingMoreCustomListEntries={isFetchingMoreCustomListEntries}
          nextPageUrl={nextPageUrl}
          listId={listId}
          loadMoreEntries={loadMoreEntries}
        />
      </div>
    </DragDropContext>
  );
}
