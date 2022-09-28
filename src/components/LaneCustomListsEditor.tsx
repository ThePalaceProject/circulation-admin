import * as React from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { CustomListData } from "../interfaces";
import AddIcon from "./icons/AddIcon";
import TrashIcon from "./icons/TrashIcon";
import GrabIcon from "./icons/GrabIcon";
import EditableInput from "./EditableInput";
import { Button } from "library-simplified-reusable-components";

export interface LaneCustomListsEditorProps
  extends React.Props<LaneCustomListsEditor> {
  allCustomLists: CustomListData[];
  customListIds: number[];
  filter?: string;
  filteredCustomLists?: CustomListData[];
  changeFilter?: (value: string) => void;
  onUpdate?: (customListIds: number[]) => void;
}

export interface LaneCustomListsEditorState {
  draggingFrom: string | null;
}

/** Drag and drop interface for adding custom lists to a lane. */
export default class LaneCustomListsEditor extends React.Component<
  LaneCustomListsEditorProps,
  LaneCustomListsEditorState
> {
  static defaultProps = {
    filter: "owned",
    filteredCustomLists: [],
  };

  constructor(props) {
    super(props);
    this.state = {
      draggingFrom: null,
    };

    this.onDragStart = this.onDragStart.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
  }

  renderFilterSelect(): JSX.Element {
    const filters = [
      ["All", ""],
      ["Owned", "owned"],
      ["Subscribed", "shared-in"],
    ];

    return (
      <fieldset>
        <legend className="visuallyHidden">Select filter type</legend>

        <EditableInput
          elementType="select"
          name="filter"
          label="Show "
          value={this.props.filter}
          onChange={this.props.changeFilter}
        >
          {filters.map(([label, value]) => (
            <option
              key={value}
              value={value}
              aria-selected={this.props.filter === value}
            >
              {label}
            </option>
          ))}
        </EditableInput>
      </fieldset>
    );
  }

  render(): JSX.Element {
    return (
      <DragDropContext
        onDragStart={this.onDragStart}
        onDragEnd={this.onDragEnd}
      >
        <div className="lane-custom-lists-drag-and-drop">
          <div className="available-lists">
            <div className="droppable-header">
              <h4>Available Lists ({this.listsNotInLane().length})</h4>
              {this.renderFilterSelect()}
            </div>
            <Droppable
              droppableId="available-lists"
              isDropDisabled={this.state.draggingFrom !== "current-lists"}
            >
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  className={
                    snapshot.isDraggingOver
                      ? "droppable dragging-over"
                      : "droppable"
                  }
                >
                  {this.state.draggingFrom === "current-lists" && (
                    <p>Drag lists here to remove them from the lane.</p>
                  )}
                  {this.state.draggingFrom !== "current-lists" &&
                    this.listsNotInLane().map((list) => (
                      <Draggable key={list.id} draggableId={list.id}>
                        {(provided, snapshot) => (
                          <div>
                            <div
                              className={
                                "available-list" +
                                (snapshot.isDragging ? " dragging" : "")
                              }
                              ref={provided.innerRef}
                              style={provided.draggableStyle}
                              {...provided.dragHandleProps}
                            >
                              <GrabIcon />
                              <div className="list-info">
                                <div className="list-name">{list.name}</div>
                                <div className="list-count">
                                  Items in list: {list.entry_count}
                                </div>
                                <div className="list-id">ID-{list.id}</div>
                              </div>
                              <div className="links">
                                <Button
                                  className="inverted"
                                  callback={() => {
                                    this.add(list.id);
                                  }}
                                  content={
                                    <span>
                                      Add to lane <AddIcon />
                                    </span>
                                  }
                                />
                              </div>
                            </div>
                            {provided.placeholder}
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>

          <div className="current-lists">
            <div className="droppable-header">
              <h4>Lists in this Lane ({this.listsInLane().length})</h4>
            </div>
            <Droppable
              droppableId="current-lists"
              isDropDisabled={this.state.draggingFrom !== "available-lists"}
            >
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  className={
                    snapshot.isDraggingOver
                      ? " droppable dragging-over"
                      : "droppable"
                  }
                >
                  <p>Drag lists here to add them to the lane.</p>
                  {this.listsInLane().map((list) => (
                    <Draggable key={list.id} draggableId={list.id}>
                      {(provided, snapshot) => (
                        <div>
                          <div
                            className={
                              "current-list" +
                              (snapshot.isDragging ? " dragging" : "")
                            }
                            ref={provided.innerRef}
                            style={provided.draggableStyle}
                            {...provided.dragHandleProps}
                          >
                            <GrabIcon />
                            <div className="list-info">
                              <div className="list-name">{list.name}</div>
                              <div className="list-count">
                                Items in list: {list.entry_count}
                              </div>
                              <div className="list-id">ID-{list.id}</div>
                            </div>
                            <div className="links">
                              <Button
                                className="danger"
                                callback={() => {
                                  this.remove(list.id);
                                }}
                                content={
                                  <span>
                                    Remove from lane <TrashIcon />
                                  </span>
                                }
                              />
                            </div>
                          </div>
                          {provided.placeholder}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
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
    for (const list of this.props.filteredCustomLists || []) {
      let found = false;
      for (const listId of this.getCustomListIds()) {
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
      for (const listId of this.getCustomListIds()) {
        if (list.id === listId) {
          lists.push(list);
        }
      }
    }
    return lists;
  }

  add(listId) {
    const customListIds = this.getCustomListIds();
    customListIds.push(parseInt(String(listId), 10));
    this.setState({ draggingFrom: null });
    if (this.props.onUpdate) {
      this.props.onUpdate(customListIds);
    }
  }

  remove(listId) {
    let customListIds = this.getCustomListIds();
    customListIds = customListIds.filter((id) => id !== listId);
    this.setState({ draggingFrom: null });
    if (this.props.onUpdate) {
      this.props.onUpdate(customListIds);
    }
  }

  reset(ids: number[]) {
    this.setState({
      draggingFrom: null,
    });
    if (this.props.onUpdate) {
      this.props.onUpdate(ids);
    }
  }

  getCustomListIds(): number[] {
    return this.props.customListIds || [];
  }

  onDragStart(initial) {
    document.body.classList.add("dragging");
    const source = initial.source;
    this.setState({ draggingFrom: source.droppableId });
  }

  onDragEnd(result) {
    const draggableId = result.draggableId;
    const source = result.source;
    const destination = result.destination;

    if (
      source.droppableId === "available-lists" &&
      destination &&
      destination.droppableId === "current-lists"
    ) {
      this.add(draggableId);
    } else if (
      source.droppableId === "current-lists" &&
      destination &&
      destination.droppableId === "available-lists"
    ) {
      this.remove(draggableId);
    } else {
      this.setState({ draggingFrom: null });
    }

    document.body.classList.remove("dragging");
  }
}
