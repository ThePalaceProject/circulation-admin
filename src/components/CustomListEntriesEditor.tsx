import * as React from "react";
const dnd = require("react-beautiful-dnd");
const DragDropContext = dnd.DragDropContext;
const Droppable = dnd.Droppable;
const Draggable = dnd.Draggable;
import { CustomListEntryData } from "../interfaces";
import { CollectionData } from "opds-web-client/lib/interfaces";

export interface CustomListEntriesEditorProps extends React.Props<CustomListEntriesEditor> {
  entries?: CustomListEntryData[];
  searchResults?: CollectionData;
}

export interface CustomListEntriesEditorState {
  draggingFrom: string | null;
  entries: CustomListEntryData[];
}

export default class CustomListEntriesEditor extends React.Component<CustomListEntriesEditorProps, CustomListEntriesEditorState> {
  constructor(props) {
    super(props);
    this.state = {
      draggingFrom: null,
      entries: this.props.entries || []
    };

    this.reset = this.reset.bind(this);
    this.onDragStart = this.onDragStart.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
  }

  render(): JSX.Element {
    return (
      <DragDropContext onDragStart={this.onDragStart} onDragEnd={this.onDragEnd}>
        <div className="custom-list-drag-and-drop">
          <div className="custom-list-search-results">
            <h4>Search Results</h4>
            <Droppable
              droppableId="search-results"
              isDropDisabled={this.state.draggingFrom !== "custom-list-entries"}
              >
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  className={snapshot.isDraggingOver ? "dragging-over" : ""}
                  >
                  { this.props.searchResults && this.searchResultsNotInEntries().map(book =>
                    <Draggable key={this.getPwid(book)} draggableId={this.getPwid(book)}>
                      {(provided, snapshot) => (
                        <div>
                          <div
                            className={"search-result" + (snapshot.isDragging ? " dragging" : "")}
                            ref={provided.innerRef}
                            style={provided.draggableStyle}
                            {...provided.dragHandleProps}
                            >
                            <div className="title">{ book.title }</div>
                            <div className="authors">{ book.authors.join(", ") }</div>
                          </div>
                          { provided.placeholder }
                        </div>
                      )}
                    </Draggable>
                  )}
                  { provided.placeholder }
                </div>
              )}
              </Droppable>
          </div>

          <div className="custom-list-entries">
            <h4>Books in this List</h4>
            <Droppable
              droppableId="custom-list-entries"
              isDropDisabled={this.state.draggingFrom !== "search-results"}
              >
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  className={snapshot.isDraggingOver ? "dragging-over" : ""}
                  >
                  <p>Drag search results here to add them to the list.</p>
                  { this.state.entries && this.state.entries.map(book =>
                    <Draggable key={book.pwid} draggableId={book.pwid}>
                      {(provided, snapshot) => (
                        <div>
                          <div
                            className={"custom-list-entry" + (snapshot.isDragging ? " dragging" : "")}
                            ref={provided.innerRef}
                            style={provided.draggableStyle}
                            {...provided.dragHandleProps}
                            >
                            <div className="title">{ book.title }</div>
                            <div className="authors">{ book.authors.join(", ") }</div>
                          </div>
                          { provided.placeholder }
                        </div>
                      )}
                    </Draggable>
                  )}
                  { provided.placeholder }
                </div>
              )}
            </Droppable>
          </div>
        </div>
      </DragDropContext>
    );
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.entries && nextProps.entries !== this.props.entries) {
      this.setState({ draggingFrom: null, entries: nextProps.entries || [] });
    }
  }

  getPwid(book) {
    return book.raw["simplified:pwid"][0]["_"];
  }

  getEntries(): CustomListEntryData[] {
    return this.state.entries;
  }

  reset() {
    this.setState({
      draggingFrom: null,
      entries: this.props.entries || []
    });
  }

  searchResultsNotInEntries() {
    let entryPwids = this.state.entries.map(entry => entry.pwid);
    return this.props.searchResults.books.filter(book => !entryPwids.includes(this.getPwid(book)));
  }

  onDragStart(initial) {
    document.body.classList.add("dragging");
    const draggableId = initial.draggableId;
    const type = initial.type;
    const source = initial.source;

    this.setState({ draggingFrom: source.droppableId, entries: this.state.entries });
  }

  onDragEnd(result) {
    const draggableId = result.draggableId;
    const type = result.type;
    const source = result.source;
    const destination = result.destination;

    let entries = this.state.entries.slice(0);
    if (source.droppableId === "search-results" && destination && destination.droppableId === "custom-list-entries") {
      for (const result of this.props.searchResults.books) {
        if (this.getPwid(result) === draggableId) {
          entries.unshift({ pwid: this.getPwid(result), title: result.title, authors: result.authors });
        }
      }
    }
    if (source.droppableId === "custom-list-entries" && destination && destination.droppableId === "search-results") {
      entries = entries.filter(entry => entry.pwid !== draggableId);
    }

    this.setState({ draggingFrom: null, entries });
    document.body.classList.remove("dragging");
  }
}