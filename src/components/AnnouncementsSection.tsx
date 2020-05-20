import * as React from "react";
import { SettingData } from "../interfaces";
import AnnouncementForm from "./AnnouncementForm";
import Announcement from "./Announcement";
// import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

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
    // this.onDragStart = this.onDragStart.bind(this);
    // this.onDragEnd = this.onDragEnd.bind(this);
    this.state = { currentAnnouncements: this.props.value || [] }
  }
  // onDragStart(initial) {
  //   console.log("HIT");
  //   document.body.classList.add("dragging");
  //   const draggableId = initial.draggableId;
  //   const draggingFrom = initial.source.droppableId;
  //     // this.props.drag({ draggableId, draggingFrom });
  // }
  // onDragEnd() {
  //   console.log("DRAG END");
  // }
  addAnnouncement(announcement) {
    let announcements = this.state.currentAnnouncements;
    // let positionConflict = this.state.currentAnnouncements.filter(a => a.position === announcement.position);
    // let oldAnnouncement = this.state.currentAnnouncements.filter(a => a.content === announcement.content);
    // if (positionConflict[0]) {
    //   let extra = this.state.currentAnnouncements.filter(a => a.content !== announcement.content && a.content !== positionConflict[0].content);
    //   announcements = this.reorder(positionConflict[0], announcement.position, extra[0] || null);
    // }
    this.setState({ currentAnnouncements: announcements.concat(announcement) });
  }
  deleteAnnouncement(content) {
    this.setState({ currentAnnouncements: this.state.currentAnnouncements.filter(a => a.content !== content), editing: null});
  }
  reorder(conflicting, position, extra?) {
    if (this.state.currentAnnouncements.length < 2) {
      let newIndex = position === 1 ? 2 : 1;
      let updated = {...conflicting, ...{position: newIndex}};
      return [updated];
    } else {
      let third = this.state.currentAnnouncements.find(a => a.content !== conflicting.content);
      if (position === 2 && third.position === 3) {
        let updated = {...conflicting, ...{position: 3}};
        third = {...third, ...{position: 1}};
        return [updated, third];
      } else if (position === 3 && third.position === 2) {
        let updated = {...conflicting, ...{position: 1}};
        return [updated, third];
      }
      else if (position == 1 && third.position === 2) {
        let updated = {...conflicting, ...{position: 2}};
        third = {...third, ...{position: 3}};
        return [updated, third];
      }
      else if (position == 3 && third.position === 1) {
        let updated = {...conflicting, ...{position: 1}};
        third = {...third, ...{position: 2}};
        return [updated, third];
      }
      else if (position == 1 && third.position === 3) {
        let updated = {...conflicting, ...{position: 2}};
        return [updated, third];
      }
    }
  }
  async editAnnouncement(content) {
    await this.setState({ editing: this.state.currentAnnouncements.filter(a => a.content === content)[0], currentAnnouncements: this.state.currentAnnouncements.filter(a => a.content !== content) });
  }
  renderAnnouncement(a, provided?, snapshot?) {
    return (
      <Announcement
        key={a.content}
        content={a.content}
        startDate={a.startDate}
        endDate={a.endDate}
        position={a.position}
        delete={this.deleteAnnouncement}
        edit={this.editAnnouncement}
      />
    );
    // return (
    //   <Announcement
    //     ref={provided.innerRefk}
    //     {...provided.draggbleProps}
    //     {...provided.dragHandleProps}
    //     key={a.content}
    //     content={a.content}
    //     startDate={a.startDate}
    //     endDate={a.endDate}
    //     position={a.position}
    //     delete={this.deleteAnnouncement}
    //     edit={this.editAnnouncement}
    //   />
    // );
  }
  renderList() {
    return (

              <ul className="announcements-ul">
                {
                  this.state.currentAnnouncements.map(a =>
                      <li key={a.content}>
                        {this.renderAnnouncement(a)}
                      </li>
                  )
                }
              </ul>
    );
    // return (
    //   <Droppable droppableId="droppable">
    //     {
    //       (provided, snapshot) => {
    //         return (
    //           <ul {...provided.droppableProps} ref={provided.innerRef} className={"announcements-ul " + (snapshot.isDraggingOver ? "droppable dragging-over" : "droppable")}>
    //             {
    //               this.state.currentAnnouncements.map(a => {
    //                 return (
    //                   <Draggable
    //                     key={a.content}
    //                     draggableId={a.content}
    //                   >{(provided, snapshot) => this.renderAnnouncement(a, provided, snapshot)}
    //                   </Draggable>
    //                 )
    //               })
    //             }
    //             {provided.placeholder}
    //           </ul>
    //         )}
    //     }
    //   </Droppable>
    // );
  }
  render() {
    // <DragDropContext onDragStart={this.onDragStart} onDragEnd={this.onDragEnd}>
    // </DragDropContext>
    return (
      <div className="announcements-section">
        { this.state.currentAnnouncements.length > 0 && this.renderList() }
        { this.state.currentAnnouncements.length < 3 && <AnnouncementForm add={this.addAnnouncement} content={this.state.editing?.content} startDate={this.state.editing?.startDate} endDate={this.state.editing?.endDate} /> }
      </div>
    )
  }
}
