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
}

export interface CustomListEntriesEditorState {
  draggingFrom: string | null;
  entries: Entry[];
  deleted: Entry[];
  entryCount?: number;
}

/** Drag and drop interface for adding books from search results to a custom list. */
export default class CustomListEntriesEditor extends React.Component<CustomListEntriesEditorProps, CustomListEntriesEditorState> {
  constructor(props) {
    super(props);
    this.state = {
      draggingFrom: null,
      entries: this.props.entries || [],
      deleted: [],
      entryCount: parseInt(this.props.entryCount, 10) || 0,
    };

    this.reset = this.reset.bind(this);
    this.onDragStart = this.onDragStart.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
    this.addAll = this.addAll.bind(this);
    this.deleteAll = this.deleteAll.bind(this);
    this.loadMore = this.loadMore.bind(this);
    this.loadMoreEntries = this.loadMoreEntries.bind(this);
  }

  render(): JSX.Element {
    const TOTALPERFEED = 50;
    let {
      entries,
      deleted,
      draggingFrom,
      entryCount,
    } = this.state;
    let {
      searchResults,
      isFetchingMoreSearchResults,
      isFetchingMoreCustomListEntries,
      nextPageUrl,
    } = this.props;
    let entryListDisplay = "No books in this list";

    if (entries.length) {
      let entriesCount;
      // Simple case where the total is less than 50.
      if (entryCount <= TOTALPERFEED) {
        entriesCount = entries.length;
      } else {
        // If adding to a list makes the entries total over 50, then we just want to
        // keep track of new additions.
        if (entries.length > TOTALPERFEED) {
          entriesCount = entryCount + (entries.length % TOTALPERFEED);
        } else {
          // Otherwise, we want to subtract any deletions.
          entriesCount = entryCount - (TOTALPERFEED - entries.length);
        }
      }

      let totalStr = ` of ${entriesCount}`;
      entryListDisplay = `Displaying 1 - ${entries.length}${totalStr} Books`;
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
              { (entries.length > 0) &&
                <button
                  className="btn btn-default delete-all-button"
                  onClick={this.deleteAll}
                  >Delete all from list
                    <TrashIcon />
                </button>
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
    if (nextProps.entries && nextProps.entries !== this.props.entries) {
      this.setState({
        draggingFrom: null,
        entries: nextProps.entries || [],
        deleted: [],
        entryCount: parseInt(nextProps.entryCount, 10),
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
    return this.state.entries;
  }

  getDeleted(): Entry[] {
    return this.state.deleted;
  }

  reset() {
    this.setState({
      draggingFrom: null,
      entries: this.props.entries || [],
      deleted: [],
    });
    if (this.props.onUpdate) {
      this.props.onUpdate(this.props.entries || []);
    }
  }

  searchResultsNotInEntries() {
    let entryUrns = this.state.entries.map(entry => entry.id);
    return this.props.searchResults.books.filter(book => {
      for (const entryUrn of entryUrns) {
        if (entryUrn === book.id) {
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
      });
    }

    document.body.classList.remove("dragging");
  }

  add(urn: string) {
    let entries = this.state.entries.slice(0);
    for (const result of this.props.searchResults.books) {
      if (result.id === urn) {
        const medium = this.getMedium(result);
        const language = this.getLanguage(result);
        entries.unshift({
          id: result.id,
          title: result.title,
          authors: result.authors,
          url: result.url,
          medium,
          language,
        });
      }
    }
    this.setState({
      draggingFrom: null,
      entries,
      deleted: this.state.deleted,
    });
    if (this.props.onUpdate) {
      this.props.onUpdate(entries);
    }
  }

  delete(urn: string) {
    let entries = this.state.entries.slice(0);
    let deleted = this.state.entries.filter(entry => entry.id === urn);
    entries = entries.filter(entry => entry.id !== urn);
    this.setState({
      draggingFrom: null,
      entries,
      deleted: this.state.deleted.concat(deleted),
    });
    if (this.props.onUpdate) {
      this.props.onUpdate(entries);
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

    for (const entry of this.state.entries) {
      entries.push(entry);
    }

    this.setState({
      draggingFrom: null,
      entries,
      deleted: this.state.deleted,
    });
    if (this.props.onUpdate) {
      this.props.onUpdate(entries);
    }
  }

  deleteAll() {
    this.setState({
      draggingFrom: null,
      entries: [],
      deleted: this.state.entries,
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
