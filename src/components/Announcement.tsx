import * as React from "react";
import EditableInput from "./EditableInput";
import AnnouncementForm from "./AnnouncementForm";
import { Button } from "library-simplified-reusable-components";
import { Droppable, Draggable } from "react-beautiful-dnd";

export interface AnnouncementProps {
  content?: string;
  startDate?: string;
  endDate?: string;
  onChange?: () => void;
  editable?: boolean;
  delete?: (content: string) => void;
  edit?: (content: string) => void;
}

export default class Announcement extends React.Component<AnnouncementProps, {}> {
  constructor(props: AnnouncementProps) {
    super(props);
    this.delete = this.delete.bind(this);
    this.edit = this.edit.bind(this);
  }
  edit(e) {
    e.preventDefault();
    this.props.edit(this.props.content);
  }
  delete(e) {
    e.preventDefault();
    console.log(this.props);
    this.props.delete(this.props.content);
  }
  render() {
    let announcement =
      <span>{this.props.content}: {this.props.startDate} to {this.props.endDate}</span>;
    let editButton = (
      <Button
        content="Edit"
        onClick={(e) => this.edit(e)}
        className="left-align"
      />
    )
    let deleteButton = (
      <Button
        content="Delete"
        onClick={(e) => this.delete(e)}
      />
    )
    let renderAnnouncement = (provided, snapshot) => {
      return (
        <li className="announcement">
          { announcement }
          <section className="buttons">
            { editButton }
            { deleteButton }
          </section>
        </li>
      )
    }
    return (
      <Draggable draggableId={this.props.content} key={this.props.content}>{(provided, snapshot) => renderAnnouncement(provided, snapshot)}</Draggable>
    )
  }
}
