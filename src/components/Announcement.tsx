import * as React from "react";
import EditableInput from "./EditableInput";
import AnnouncementForm from "./AnnouncementForm";
import { Button } from "library-simplified-reusable-components";

export interface AnnouncementProps {
  content?: string;
  start?: string;
  finish?: string;
  onChange?: () => void;
  id?: number;
  delete?: (id: number) => void;
  edit?: (id: number) => Promise<void>;
}

export default class Announcement extends React.Component<AnnouncementProps, {}> {
  constructor(props: AnnouncementProps) {
    super(props);
    this.delete = this.delete.bind(this);
    this.edit = this.edit.bind(this);
  }
  edit(e) {
    e.preventDefault();
    this.props.edit(this.props.id);
  }
  delete(e) {
    e.preventDefault();
    this.props.delete(this.props.id);
  }
  format(date) {
    if (date) {
      let [year, month, day] = date.split("-");
      return `${month}/${day}/${year}`;
    }
    return "";
  }
  render() {
    let announcement = (
      <section className="announcement-info">
        <section className="dates">
          {this.format(this.props.start)} – {this.format(this.props.finish)}
        </section>
        <span>{this.props.content}</span>
      </section>
    );
    let editButton = (
      <Button
        content="Edit"
        onClick={(e) => this.edit(e)}
        className="left-align"
      />
    );
    let deleteButton = (
      <Button
        content="Delete"
        onClick={(e) => this.delete(e)}
        className="left-align"
      />
    );
    let renderAnnouncement = () => {
      return (
        <div className="announcement">
          { announcement }
          <hr />
          <section className="buttons">
            { editButton }
            { deleteButton }
          </section>
        </div>
      );
    };
    return (
      renderAnnouncement()
    );
  }
}
