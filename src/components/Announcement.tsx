import * as React from "react";
import { Button } from "library-simplified-reusable-components";

export interface AnnouncementProps {
  content: string;
  start: string;
  finish: string;
  id: string;
  delete: (id: string) => void;
  edit: (id: string) => Promise<void>;
}

export default class Announcement extends React.Component<AnnouncementProps, {}> {
  constructor(props: AnnouncementProps) {
    super(props);
    this.delete = this.delete.bind(this);
    this.edit = this.edit.bind(this);
  }
  edit(e: Event) {
    e.preventDefault();
    this.props.edit(this.props.id);
  }
  delete(e: Event) {
    e.preventDefault();
    this.props.delete(this.props.id);
  }
  format(date: string): string {
    // The date is stored in the format year-month-day, because that's the format that the date picker
    // in AnnouncementForm understands.  But month/day/year looks nicer for display purposes.
    if (date) {
      let [year, month, day] = date.split("-");
      return `${month}/${day}/${year}`;
    }
    return "";
  }
  render(): JSX.Element {
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
  }
}
