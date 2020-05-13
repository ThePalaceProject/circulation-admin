import * as React from "react";
import { SettingData } from "../interfaces";
import AnnouncementForm from "./AnnouncementForm";
import Announcement from "./Announcement";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

export interface AnnouncementsSectionProps {
  setting: SettingData;
  value?: Array<any>;
}
export interface AnnouncementsSectionState {
  currentAnnouncements: Array<any>;
  editing?: any;
}

export default class AnnouncementsSection extends React.Component<AnnouncementsSectionProps, AnnouncementsSectionState> {
  constructor(props) {
    super(props);
    this.addAnnouncement = this.addAnnouncement.bind(this);
    this.deleteAnnouncement = this.deleteAnnouncement.bind(this);
    this.editAnnouncement = this.editAnnouncement.bind(this);
    this.onDragStart = this.onDragStart.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
    this.state = { currentAnnouncements: this.props.value || [] }
  }
  onDragStart(initial) {
    console.log("HIT");
    document.body.classList.add("dragging");
    const draggableId = initial.draggableId;
    const draggingFrom = initial.source.droppableId;
    console.log(draggableId, draggingFrom);
      // this.props.drag({ draggableId, draggingFrom });
  }
  onDragEnd() {
    console.log("DRAG END");
  }
  addAnnouncement(announcement) {
    this.setState({ currentAnnouncements: this.state.currentAnnouncements.concat(announcement) });
  }
  deleteAnnouncement(content) {
    this.setState({ currentAnnouncements: this.state.currentAnnouncements.filter(a => a.content !== content), editing: null});
  }
  async editAnnouncement(content) {
    await this.setState({ editing: this.state.currentAnnouncements.filter(a => a.content === content)[0], currentAnnouncements: this.state.currentAnnouncements.filter(a => a.content !== content) });
  }
  renderAnnouncement(a, provided, snapshot) {
    return (
      <Announcement
        ref={provided.innerRefk}
        {...provided.draggbleProps}
        {...provided.dragHandleProps}
        key={a.content}
        content={a.content}
        startDate={a.startDate}
        endDate={a.endDate}
        delete={this.deleteAnnouncement}
        edit={this.editAnnouncement}
      />
    );
  }
  renderList() {
    return (
      <Droppable droppableId="droppable">
        {
          (provided, snapshot) => {
            return (
              <ul {...provided.droppableProps} ref={provided.innerRef} className={"announcements-ul " + (snapshot.isDraggingOver ? "droppable dragging-over" : "droppable")}>
                {
                  this.state.currentAnnouncements.map(a => {
                    return (
                      <Draggable
                        key={a.content}
                        draggableId={a.content}
                      >{(provided, snapshot) => this.renderAnnouncement(a, provided, snapshot)}
                      </Draggable>
                    )
                  })
                }
                {provided.placeholder}
              </ul>
            )}
        }
      </Droppable>
    );
  }
  render() {
    return (
      <div className="announcements-section">
        <DragDropContext onDragStart={this.onDragStart} onDragEnd={this.onDragEnd}>
          { this.renderList() }
        </DragDropContext>
        { this.state.currentAnnouncements.length < 3 && <AnnouncementForm add={this.addAnnouncement} content={this.state.editing?.content} startDate={this.state.editing?.startDate} endDate={this.state.editing?.endDate} /> }
      </div>
    )
  }
}
