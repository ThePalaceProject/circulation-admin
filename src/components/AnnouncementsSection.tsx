import * as React from "react";
import { SettingData, AnnouncementData } from "../interfaces";
import AnnouncementForm from "./AnnouncementForm";
import Announcement from "./Announcement";

export interface AnnouncementsSectionProps {
  setting: SettingData;
  value?: Array<any>;
}

export interface AnnouncementsSectionState {
  currentAnnouncements: Array<AnnouncementData>;
  editing?: AnnouncementData | null;
}

export default class AnnouncementsSection extends React.Component<
  AnnouncementsSectionProps,
  AnnouncementsSectionState
> {
  constructor(props: AnnouncementsSectionProps) {
    super(props);
    this.addAnnouncement = this.addAnnouncement.bind(this);
    this.deleteAnnouncement = this.deleteAnnouncement.bind(this);
    this.editAnnouncement = this.editAnnouncement.bind(this);
    this.getValue = this.getValue.bind(this);
    this.state = {
      currentAnnouncements: Array.isArray(this.props.value)
        ? this.props.value
        : [],
      editing: null,
    };
  }
  addAnnouncement(announcement: AnnouncementData) {
    const announcements = this.state.currentAnnouncements;
    // If the announcement hasn't been saved yet, it does not have an ID; the ID is assigned by the server code.  But editing
    // announcements involves finding them by their ID, so we give the new announcement a temporary ID just so that we'll be able
    // to edit it.  The temporary ID gets blanked out before the announcement goes to the server, so the permanent ID will still get
    // assigned on the back end.
    if (!announcement.id) {
      const tempId = ["temp_1", "temp_2", "temp_3"].find(
        (x) => !announcements.map((a) => a.id).includes(x)
      );
      announcement.id = tempId;
    }
    this.setState({
      currentAnnouncements: announcements.concat(announcement),
      editing: null,
    });
  }
  deleteAnnouncement(id: string) {
    if (
      window.confirm(
        "This will remove this announcement from your list. Are you sure you want to continue?"
      )
    ) {
      this.setState({
        currentAnnouncements: this.state.currentAnnouncements.filter(
          (a) => a.id !== id
        ),
        editing: null,
      });
    }
  }
  editAnnouncement(id: string): void {
    const editing = this.state.currentAnnouncements.find((a) => a.id === id);
    let currentAnnouncements = this.state.currentAnnouncements.filter(
      (a) => a.id !== id
    );
    if (this.state.editing && this.state.editing.id !== id) {
      // Switch between editing two announcements without making the first one disappear.
      currentAnnouncements = currentAnnouncements.concat(this.state.editing);
    }
    this.setState({ editing, currentAnnouncements });
  }
  renderAnnouncement(a: AnnouncementData): JSX.Element {
    return (
      <Announcement
        key={a.id}
        content={a.content}
        start={a.start}
        finish={a.finish}
        id={a.id}
        delete={this.deleteAnnouncement}
        edit={this.editAnnouncement}
      />
    );
  }
  renderList(): JSX.Element {
    const compareStartDate = (x, y) => {
      if (x.start < y.start) {
        return -1;
      } else if (x.start > y.start) {
        return 1;
      }
    };
    return (
      <ul className="announcements-ul">
        <h4>Scheduled Announcements:</h4>
        <p>You can have a maximum of 3 announcements.</p>
        <hr />
        {Array.isArray(this.state.currentAnnouncements) &&
          this.state.currentAnnouncements
            .sort(compareStartDate)
            .map((a) => <li key={a.id}>{this.renderAnnouncement(a)}</li>)}
      </ul>
    );
  }
  renderForm(): JSX.Element {
    return (
      <AnnouncementForm
        add={this.addAnnouncement}
        content={this.state.editing?.content}
        start={this.state.editing?.start}
        finish={this.state.editing?.finish}
        id={this.state.editing?.id}
      />
    );
  }
  render(): JSX.Element {
    return (
      <div className="announcements-section">
        {this.state.currentAnnouncements.length > 0 && this.renderList()}
        {this.state.currentAnnouncements.length < 3 && this.renderForm()}
      </div>
    );
  }
  getValue(): Array<AnnouncementData> {
    // If there are any new announcements, blank out their temporary IDs so that the server wil assign them permanent ones.
    return this.state.currentAnnouncements.map((a) =>
      a.id.match(/temp_/)
        ? ({
            content: a.content,
            start: a.start,
            finish: a.finish,
          } as AnnouncementData)
        : a
    );
  }
}
