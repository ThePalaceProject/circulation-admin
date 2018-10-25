import * as React from "react";
const dnd = require("react-beautiful-dnd");
const DragDropContext = dnd.DragDropContext;
const Droppable = dnd.Droppable;
const Draggable = dnd.Draggable;
import { CollectionData, BookData } from "opds-web-client/lib/interfaces";
import LoadButton from "./LoadButton";
import ApplyIcon from "./icons/ApplyIcon";
import TrashIcon from "./icons/TrashIcon";
import GrabIcon from "./icons/GrabIcon";
import AddIcon from "./icons/AddIcon";
import XCloseIcon from "./icons/XCloseIcon";
import MoreDotsIcon from "./icons/MoreDotsIcon";
import {
  AudioHeadphoneIcon,
  BookIcon,
} from "@nypl/dgx-svg-icons";
import CatalogLink from "opds-web-client/lib/components/CatalogLink";

export interface Entry extends BookData {
  medium?: string;
}

export interface CustomListEntriesEditorProps extends React.Props<CustomListEntriesEditor> {
  entries?: Entry[];
  searchResults?: CollectionData;
  loadMoreSearchResults: (url: string) => Promise<CollectionData>;
  loadMoreEntries: (url: string) => Promise<CollectionData>;
  onUpdate?: (entries: Entry[]) => void;
  isFetchingMoreSearchResults: boolean;
  isFetchingMoreCustomListEntries: boolean;
  opdsFeedUrl?: string;
  nextPageUrl?: string;
  entryCount?: string;
  listId?: string | number;
}

export interface CustomListEntriesEditorState {
  draggingFrom: string | null;
  entries: Entry[];
  deleted: Entry[];
  added: Entry[];
  totalVisibleEntries?: number;
}

/** Drag and drop interface for adding books from search results to a custom list. */
export default class CustomListEntriesEditor extends React.Component<CustomListEntriesEditorProps, CustomListEntriesEditorState> {
  constructor(props) {
    super(props);
    this.state = {
      draggingFrom: null,
      entries: this.props.entries || [],
      deleted: [],
      added: [],
      totalVisibleEntries: this.props.entries ? this.props.entries.length : 0,
    };

    this.reset = this.reset.bind(this);
    this.onDragStart = this.onDragStart.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
    this.addAll = this.addAll.bind(this);
    this.deleteAll = this.deleteAll.bind(this);
    this.loadMore = this.loadMore.bind(this);
    this.loadMoreEntries = this.loadMoreEntries.bind(this);
    this.clearState = this.clearState.bind(this);
  }

  render(): JSX.Element {
    let {
      entries,
      deleted,
      added,
      draggingFrom,
      totalVisibleEntries,
    } = this.state;
    let {
      searchResults,
      isFetchingMoreSearchResults,
      isFetchingMoreCustomListEntries,
      nextPageUrl,
      entryCount,
    } = this.props;
    let entryListDisplay = "No books in this list";
    let totalEntriesServer = parseInt(entryCount, 10);
    let displayTotal;
    let entriesCount;
    let booksText;

    if (totalVisibleEntries && totalEntriesServer) {
      if (entries.length) {
        entriesCount = totalEntriesServer - deleted.length + added.length;
        displayTotal = `1 - ${entries.length} of ${entriesCount}`;
        booksText = entriesCount === 1 ? "Book" : "Books";
        entryListDisplay = `Displaying ${displayTotal} ${booksText}`;
      } else if (totalEntriesServer - deleted.length !== 0) {
        // The "delete all" button was clicked so there are no books
        // in the visible list, but there could be more on the server.
        entriesCount = totalEntriesServer > deleted.length ?
          totalEntriesServer - deleted.length : 0;
        displayTotal = `0 - 0 of ${entriesCount}`;
        booksText = entriesCount === 1 ? "Book" : "Books";
        entryListDisplay = `Displaying ${displayTotal} ${booksText}`;
      }
    } else {
      // No existing entries in a list so it's a new list or all entries
      // were recently deleted.
      if (entries && entries.length) {
        displayTotal = `1 - ${entries.length} of ${entries.length}`;
        booksText = entries.length === 1 ? "Book" : "Books";
        entryListDisplay = `Displaying ${displayTotal} ${booksText}`;
      }
    }

    return (
      <DragDropContext onDragStart={this.onDragStart} onDragEnd={this.onDragEnd}>
        <div className="custom-list-drag-and-drop">
          <div className="custom-list-search-results">
            <div className="droppable-header">
              <h4>Search Results</h4>
              { searchResults && (this.searchResultsNotInEntries().length > 0) &&
                <button
                  className="btn btn-default add-all-button"
                  onClick={this.addAll}
                  >Add all to list
                    <ApplyIcon />
                </button>
              }
            </div>
            <Droppable
              droppableId="search-results"
              isDropDisabled={draggingFrom !== "custom-list-entries"}
            >
              {(provided, snapshot) => (
                <ul
                  ref={provided.innerRef}
                  className={snapshot.isDraggingOver ? "droppable dragging-over" : "droppable"}
                  >
                  { draggingFrom === "custom-list-entries" &&
                    <p>Drag books here to remove them from the list.</p>
                  }
                  { (draggingFrom !== "custom-list-entries") && searchResults && this.searchResultsNotInEntries().map((book, i) =>
                    <Draggable key={book.id} draggableId={book.id}>
                      {(provided, snapshot) => (
                        <li>
                          <div
                            className={"search-result" + (snapshot.isDragging ? " dragging" : "")}
                            ref={provided.innerRef}
                            style={provided.draggableStyle}
                            {...provided.dragHandleProps}
                          >
                            <GrabIcon />
                            <div>
                              <div className="title">{ book.title }</div>
                              <div className="authors">{ book.authors.join(", ") }</div>
                            </div>
                            {this.getMediumSVG(this.getMedium(book))}
                            {this.getCatalogLink(book)}
                            <div className="links">
                              <a
                                href="#"
                                onClick={() => { this.add(book.id); }}
                                >Add to list
                                  <AddIcon />
                              </a>
                            </div>
                          </div>
                          { provided.placeholder }
                        </li>
                      )}
                    </Draggable>
                  )}
                  { provided.placeholder }
                </ul>
              )}
              </Droppable>
              { searchResults && searchResults.nextPageUrl &&
                <LoadButton
                  isFetching={isFetchingMoreSearchResults}
                  loadMore={this.loadMore}
                />
              }
          </div>

          <div className="custom-list-entries">
            <div className="droppable-header">
              <h4>{entryListDisplay}</h4>
              { (entries && entries.length > 0) &&
                <div>
                  <span>Remove all currently visible items from list:
                  </span>
                  <button
                    className="btn btn-default delete-all-button"
                    onClick={this.deleteAll}
                    >Delete
                      <TrashIcon />
                  </button>
                </div>
              }
            </div>
            <Droppable
              droppableId="custom-list-entries"
              isDropDisabled={draggingFrom !== "search-results"}
              >
              {(provided, snapshot) => (
                <ul
                  ref={provided.innerRef}
                  id="custom-list-entries-droppable"
                  className={snapshot.isDraggingOver ? " droppable dragging-over" : "droppable"}
                  >
                  <p>Drag search results here to add them to the list.</p>
                  { entries && entries.map((book, i) => (
                      <Draggable key={book.id} draggableId={book.id}>
                        {(provided, snapshot) => (
                          <li>
                            <div
                              className={"custom-list-entry" + (snapshot.isDragging ? " dragging" : "")}
                              ref={provided.innerRef}
                              style={provided.draggableStyle}
                              {...provided.dragHandleProps}
                            >
                              <GrabIcon />
                              <div>
                                <div className="title">{ book.title }</div>
                                <div className="authors">{ book.authors.join(", ") }</div>
                              </div>
                              {this.getMediumSVG(this.getMedium(book))}
                              {this.getCatalogLink(book)}
                              <div className="links">
                                <a
                                  href="#"
                                  onClick={() => { this.delete(book.id); }}
                                  >Remove from list
                                    <TrashIcon />
                                </a>
                              </div>
                            </div>
                            { provided.placeholder }
                          </li>
                        )}
                      </Draggable>
                    ))}
                  { provided.placeholder }
                </ul>
              )}
            </Droppable>
            { nextPageUrl &&
              <LoadButton
                isFetching={isFetchingMoreCustomListEntries}
                loadMore={this.loadMoreEntries}
              />
            }
          </div>
        </div>
      </DragDropContext>
    );
  }

  componentWillReceiveProps(nextProps) {
    let deleted = this.state.deleted;
    let added = this.state.added;
    let totalVisibleEntries = this.state.totalVisibleEntries;
    // We need to reset the deleted and added entries if we are moving to a new list.
    if (this.props.listId !== nextProps.listId) {
      deleted = [];
      added = [];
      this.setState({
        draggingFrom: null,
        entries: nextProps.entries,
        deleted: deleted,
        added: added,
        totalVisibleEntries: nextProps.entries.length,
      });
    }

    if (nextProps.entries && nextProps.entries !== this.props.entries) {
      let newEntries;
      // If there are any deleted entries and the user loads more entries,
      // we want to remove them from the entire combined list.
      if (this.state.deleted.length) {
        this.state.deleted.forEach(deleteEntry => {
          nextProps.entries.forEach((entry, i) => {
            if (entry.id === deleteEntry.id) {
              nextProps.entries.splice(i, 1);
            }
          });
        });
      }
      newEntries = nextProps.entries;

      // If there are any added entries and the user loads more entries,
      // we want to added them back to the entire combined list.
      if (this.state.added.length) {
        newEntries = this.state.added.concat(nextProps.entries);
      }

      this.setState({
        draggingFrom: null,
        entries: newEntries,
        deleted: deleted,
        added: added,
        totalVisibleEntries: newEntries.length,
      });

      const droppableList = document.getElementById("custom-list-entries-droppable");

      if (droppableList) {
        droppableList.scrollTo(0, 0);
      }
    }
  }

  getCatalogLink(book) {
    if (!book.url) {
      return null;
    }

    return (
      <CatalogLink
        collectionUrl={this.props.opdsFeedUrl}
        bookUrl={book.url}
        title={book.title}
        target="_blank"
      >
        View details
      </CatalogLink>
    );
  }

  getMedium(book) {
    return book.medium || book.raw["$"]["schema:additionalType"].value;
  }

  getLanguage(book) {
    return book.language || "";
  }

  getMediumSVG(medium) {
    if (!medium) {
      return null;
    }

    const svgMediumTypes = {
      "http://bib.schema.org/Audiobook": <AudioHeadphoneIcon ariaHidden className="draggable-item-icon" />,
      "http://schema.org/EBook": <BookIcon ariaHidden className="draggable-item-icon" />,
    };

    return svgMediumTypes[medium] || null;
  }

  getEntries(): Entry[] {
    return this.state.entries || [];
  }

  getDeleted(): Entry[] {
    return this.state.deleted;
  }

  reset() {
    this.setState({
      draggingFrom: null,
      entries: this.props.entries,
      deleted: [],
      added: [],
      totalVisibleEntries: this.props.entries ? this.props.entries.length : 0,
    });
    if (this.props.onUpdate) {
      this.props.onUpdate(this.props.entries || []);
    }
  }

  searchResultsNotInEntries() {
    let entryIds = this.state.entries && this.state.entries.length ?
      this.state.entries.map(entry => entry.id) : [];
    return this.props.searchResults.books.filter(book => {
      for (const entryId of entryIds) {
        if (entryId === book.id) {
          return false;
        }
      }
      return true;
    });
  }

  onDragStart(initial) {
    document.body.classList.add("dragging");
    const draggableId = initial.draggableId;
    const type = initial.type;
    const source = initial.source;

    this.setState({
      draggingFrom: source.droppableId,
      entries: this.state.entries,
      deleted: this.state.deleted,
      added: this.state.added,
    });
  }

  onDragEnd(result) {
    const draggableId = result.draggableId;
    const type = result.type;
    const source = result.source;
    const destination = result.destination;

    if (source.droppableId === "search-results" && destination && destination.droppableId === "custom-list-entries") {
      this.add(draggableId);
    }
    else if (source.droppableId === "custom-list-entries" && destination && destination.droppableId === "search-results") {
      this.delete(draggableId);
    } else {
      this.setState({
        draggingFrom: null,
        entries: this.state.entries,
        deleted: this.state.deleted,
        added: this.state.added,
      });
    }

    document.body.classList.remove("dragging");
  }

  add(id: string) {
    let entries = this.state.entries ? this.state.entries.slice(0) : [];
    let entry;
    for (const result of this.props.searchResults.books) {
      if (result.id === id) {
        const medium = this.getMedium(result);
        const language = this.getLanguage(result);
        entry = {
          id: result.id,
          title: result.title,
          authors: result.authors,
          url: result.url,
          medium,
          language,
        };
        entries.unshift(entry);
      }
    }

    let added = this.state.added.filter(entry => entry.id !== id);
    let inDeleted = this.state.deleted.filter(entry => entry.id === id);
    let deleted = this.state.deleted.filter(entry => entry.id !== id);
    let propEntries = this.props.entries ?
      this.props.entries.filter(entry => entry.id === id) : [];
    this.setState({
      draggingFrom: null,
      entries,
      deleted,
      added: propEntries.length ? added : added.concat([entry]),
    });
    if (this.props.onUpdate) {
      this.props.onUpdate(entries);
    }
  }

  delete(id: string) {
    let entries = this.state.entries.slice(0);
    let deleted = this.state.deleted.filter(entry => entry.id !== id);
    let deletedEntry = this.state.entries.filter(entry => entry.id === id);
    let added = this.state.added.filter(entry => entry.id !== id);
    let inAdded = this.props.entries.filter(entry => entry.id === id);
    entries = entries.filter(entry => entry.id !== id);
    this.setState({
      draggingFrom: null,
      entries,
      deleted: inAdded.length ? deleted.concat(deletedEntry) : deleted,
      added,
    });
    if (this.props.onUpdate) {
      this.props.onUpdate(entries);
    }
  }

  clearState() {
    this.setState({
      draggingFrom: null,
      entries: this.state.entries,
      deleted: [],
      added: [],
      totalVisibleEntries: this.state.entries.length,
    });
    if (this.props.onUpdate) {
      this.props.onUpdate(this.state.entries);
    }
  }

  addAll() {
    let entries = [];

    for (const result of this.searchResultsNotInEntries()) {
      const medium = this.getMedium(result);
      const language = this.getLanguage(result);
      entries.push({
        id: result.id,
        title: result.title,
        authors: result.authors,
        url: result.url,
        medium,
        language,
      });
    }
    let existingPropEntriesIds = this.props.entries ?
      this.props.entries.map(entry => entry.id) : [];
    let newEntriesIds = entries.map(entry => entry.id);
    let newlyAdded = entries.filter(book => {
      for (const newEntriesId of existingPropEntriesIds) {
        if (newEntriesId === book.id) {
          return false;
        }
      }
      return true;
    });
    let deleted = this.state.deleted.filter(book => {
      for (const newEntriesId of newEntriesIds) {
        if (newEntriesId === book.id) {
          return false;
        }
      }
      return true;
    });
    let added = this.state.added.concat(newlyAdded);

    for (const entry of this.state.entries) {
      entries.push(entry);
    }

    this.setState({
      draggingFrom: null,
      entries,
      deleted,
      added,
    });
    if (this.props.onUpdate) {
      this.props.onUpdate(entries);
    }
  }

  deleteAll() {
    let entries = this.state.entries.slice(0);
    let propEntriesId = this.props.entries ?
      this.props.entries.map(entry => entry.id) : [];
    let newlyDeleted = entries.filter(book => {
      for (const propEntryId of propEntriesId) {
        if (propEntryId === book.id) {
          return true;
        }
      }
      return false;
    });

    this.setState({
      draggingFrom: null,
      entries: [],
      deleted: this.state.deleted.concat(newlyDeleted),
      added: [],
    });
    if (this.props.onUpdate) {
      this.props.onUpdate([]);
    }
  }

  loadMore() {
    if (this.props.searchResults && !this.props.isFetchingMoreSearchResults) {
      let nextPageUrl = this.props.searchResults.nextPageUrl;
      this.props.loadMoreSearchResults(nextPageUrl);
    }
  }

  loadMoreEntries() {
    if (this.props.entries && !this.props.isFetchingMoreCustomListEntries) {
      let nextPageUrl = this.props.nextPageUrl;
      this.props.loadMoreEntries(nextPageUrl);
    }
  }
}
