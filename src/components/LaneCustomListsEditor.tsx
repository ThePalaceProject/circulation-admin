import * as React from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { CustomListData } from "../interfaces";
import AddIcon from "./icons/AddIcon";
import TrashIcon from "./icons/TrashIcon";
import GrabIcon from "./icons/GrabIcon";
import { Button } from "library-simplified-reusable-components";

export interface LaneCustomListsEditorProps {
  allCustomLists: CustomListData[];
  customListIds: number[];
  onUpdate?: (customListIds: number[]) => void;
}

/** Drag and drop interface for adding custom lists to a lane. */
export default class LaneCustomListsEditor extends React.Component<
  LaneCustomListsEditorProps
> {
  constructor(props) {
    super(props);
    this.onDragStart = this.onDragStart.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
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
            </div>
            <Droppable droppableId="available-lists">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  className={
                    snapshot.isDraggingOver
                      ? "droppable dragging-over"
                      : "droppable"
                  }
                >
                  {snapshot.isDraggingOver && (
                    <p>Drag lists here to remove them from the lane.</p>
                  )}
                  {this.listsNotInLane().map((list, index) => (
                    <Draggable
                      key={list.id}
                      draggableId={list.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          className={
                            "available-list" +
                            (snapshot.isDragging ? " dragging" : "")
                          }
                          ref={provided.innerRef}
                          {...provided.draggableProps}
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
            <Droppable droppableId="current-lists">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  className={
                    snapshot.isDraggingOver
                      ? "droppable dragging-over"
                      : "droppable"
                  }
                >
                  {snapshot.isDraggingOver && (
                    <p>Drag lists here to add them to the lane.</p>
                  )}
                  {this.listsInLane().map((list, index) => (
                    <Draggable
                      key={list.id}
                      draggableId={list.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          className={
                            "current-list" +
                            (snapshot.isDragging ? " dragging" : "")
                          }
                          ref={provided.innerRef}
                          {...provided.draggableProps}
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
    for (const list of this.props.allCustomLists || []) {
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
    customListIds.push(parseInt(listId, 10));
    if (this.props.onUpdate) {
      this.props.onUpdate(customListIds);
    }
  }

  remove(listId) {
    let customListIds = this.getCustomListIds();
    customListIds = customListIds.filter((id) => id !== listId);
    if (this.props.onUpdate) {
      this.props.onUpdate(customListIds);
    }
  }

  reset(ids: number[]) {
    if (this.props.onUpdate) {
      this.props.onUpdate(ids);
    }
  }

  getCustomListIds(): number[] {
    return this.props.customListIds || [];
  }

  onDragStart() {
    document.body.classList.add("dragging");
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
    }

    document.body.classList.remove("dragging");
  }
}
