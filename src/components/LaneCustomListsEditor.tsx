import * as React from "react";
const dnd = require("react-beautiful-dnd");
const DragDropContext = dnd.DragDropContext;
const Droppable = dnd.Droppable;
const Draggable = dnd.Draggable;
import { CustomListData } from "../interfaces";
import AddIcon from "./icons/AddIcon";
import TrashIcon from "./icons/TrashIcon";
import GrabIcon from "./icons/GrabIcon";

export interface LaneCustomListsEditorProps extends React.Props<LaneCustomListsEditor> {
  allCustomLists: CustomListData[];
  customListIds: number[];
  onUpdate?: (customListIds: number[]) => void;
}

export interface LaneCustomListsEditorState {
  draggingFrom: string | null;
  customListIds: number[];
}

/** Drag and drop interface for adding custom lists to a lane. */
export default class LaneCustomListsEditor extends React.Component<LaneCustomListsEditorProps, LaneCustomListsEditorState> {

  constructor(props) {
    super(props);
    this.state = {
      draggingFrom: null,
      customListIds: this.props.customListIds || []
    };

    this.onDragStart = this.onDragStart.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
  }

  render(): JSX.Element {
    return (
      <DragDropContext onDragStart={this.onDragStart} onDragEnd={this.onDragEnd}>
        <div className="lane-custom-lists-drag-and-drop">
          <div className="available-lists">
            <div className="droppable-header">
              <h4>Available Lists ({ this.listsNotInLane().length })</h4>
            </div>
            <Droppable
              droppableId="available-lists"
              isDropDisabled={this.state.draggingFrom !== "current-lists"}
              >
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  className={snapshot.isDraggingOver ? "droppable dragging-over" : "droppable"}
                  >
                  { this.state.draggingFrom === "current-lists" &&
                    <p>Drag lists here to remove them from the lane.</p>
                  }
                  { this.state.draggingFrom !== "current-lists" && this.listsNotInLane().map(list =>
                    <Draggable key={list.id} draggableId={list.id}>
                      {(provided, snapshot) => (
                        <div>
                          <div
                            className={"available-list" + (snapshot.isDragging ? " dragging" : "")}
                            ref={provided.innerRef}
                            style={provided.draggableStyle}
                            {...provided.dragHandleProps}
                            >
                            <GrabIcon />
                            <div className="list-info">
                              <div className="list-name">{list.name}</div>
                              <div className="list-count">Items in list: {list.entry_count}</div>
                              <div className="list-id">ID-{list.id}</div>
                            </div>
                            <div className="links">
                              <a
                                href="#"
                                onClick={() => { this.add(list.id); }}
                                >Add to lane
                                  <AddIcon />
                              </a>
                            </div>
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

          <div className="current-lists">
            <div className="droppable-header">
              <h4>Lists in this Lane ({ this.listsInLane().length })</h4>
            </div>
            <Droppable
              droppableId="current-lists"
              isDropDisabled={this.state.draggingFrom !== "available-lists"}
              >
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  className={snapshot.isDraggingOver ? " droppable dragging-over" : "droppable"}
                  >
                  <p>Drag lists here to add them to the lane.</p>
                  { this.listsInLane().map(list =>
                    <Draggable key={list.id} draggableId={list.id}>
                      {(provided, snapshot) => (
                        <div>
                          <div
                            className={"current-list" + (snapshot.isDragging ? " dragging" : "")}
                            ref={provided.innerRef}
                            style={provided.draggableStyle}
                            {...provided.dragHandleProps}
                            >
                            <GrabIcon />
                            <div className="list-info">
                              <div className="list-name">{list.name}</div>
                              <div className="list-count">Items in list: {list.entry_count}</div>
                              <div className="list-id">ID-{list.id}</div>
                            </div>
                            <div className="links">
                              <a
                                href="#"
                                onClick={() => { this.remove(list.id); }}
                                >Remove from lane
                                  <TrashIcon />
                              </a>
                            </div>
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

  listsNotInLane(): CustomListData[] {
    const lists = [];
    for (const list of this.props.allCustomLists || []) {
      let found = false;
      for (const listId of this.state.customListIds) {
        if (list.id === listId) {
          found = true;
          break;
        }
      }
      if (!found) {
        lists.push(list);
      }
    }
    return lists;
  }

  listsInLane(): CustomListData[] {
    const lists = [];
    for (const list of this.props.allCustomLists || []) {
      for (const listId of this.state.customListIds) {
        if (list.id === listId) {
          lists.push(list);
        }
      }
    }
    return lists;
  }

  add(listId) {
    const customListIds = this.state.customListIds.slice(0);
    customListIds.push(parseInt(String(listId), 10));
    this.setState({ draggingFrom: null, customListIds });
    if (this.props.onUpdate) {
      this.props.onUpdate(customListIds);
    }
  }

  remove(listId) {
    let customListIds = this.state.customListIds.slice(0);
    customListIds = customListIds.filter(id => id !== listId);
    this.setState({ draggingFrom: null, customListIds });
    if (this.props.onUpdate) {
      this.props.onUpdate(customListIds);
    }
  }

  reset() {
    this.setState({
      draggingFrom: null,
      customListIds: this.props.customListIds || []
    });
    if (this.props.onUpdate) {
      this.props.onUpdate(this.props.customListIds || []);
    }
  }

  getCustomListIds(): number[] {
    return this.state.customListIds;
  }

  onDragStart(initial) {
    document.body.classList.add("dragging");
    const source = initial.source;
    this.setState({ draggingFrom: source.droppableId, customListIds: this.state.customListIds });
  }

  onDragEnd(result) {
    const draggableId = result.draggableId;
    const source = result.source;
    const destination = result.destination;

    if (source.droppableId === "available-lists" && destination && destination.droppableId === "current-lists") {
      this.add(draggableId);
    } else if (source.droppableId === "current-lists" && destination && destination.droppableId === "available-lists") {
      this.remove(draggableId);
    } else {
      this.setState({ draggingFrom: null, customListIds: this.state.customListIds });
    }

    document.body.classList.remove("dragging");
  }
}