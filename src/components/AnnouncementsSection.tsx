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

export default class AnnouncementsSection extends React.Component<AnnouncementsSectionProps, AnnouncementsSectionState> {
  constructor(props: AnnouncementsSectionProps) {
    super(props);
    this.addAnnouncement = this.addAnnouncement.bind(this);
    this.deleteAnnouncement = this.deleteAnnouncement.bind(this);
    this.editAnnouncement = this.editAnnouncement.bind(this);
    this.getValue = this.getValue.bind(this);
    this.state = { currentAnnouncements: Array.isArray(this.props.value) ? this.props.value : [], editing: null };
  }
  addAnnouncement(announcement: AnnouncementData) {
    let announcements = this.state.currentAnnouncements;
    this.setState({ currentAnnouncements: announcements.concat(announcement), editing: null });
  }
  deleteAnnouncement(id: string) {
    if (window.confirm("This will remove this announcement from your list. Are you sure you want to continue?")) {
      this.setState({ currentAnnouncements: this.state.currentAnnouncements.filter(a => a.id !== id), editing: null});
    }
  }
  async editAnnouncement(id: string) {
    let editing = this.state.currentAnnouncements.find(a => a.id === id);
    let currentAnnouncements = this.state.currentAnnouncements.filter(a => a.id !== id);
    if (this.state.editing && this.state.editing.id !== id) {
      // Switch between editing two announcements without making the first one disappear. 
      currentAnnouncements = currentAnnouncements.concat(this.state.editing);
    }
    await this.setState({ editing, currentAnnouncements });
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
    return (
      <ul className="announcements-ul">
        {
          Array.isArray(this.state.currentAnnouncements) && this.state.currentAnnouncements.map(a =>
              <li key={a.id}>
                {this.renderAnnouncement(a)}
              </li>
          )
        }
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
        { this.state.currentAnnouncements.length > 0 && this.renderList() }
        { this.state.currentAnnouncements.length < 3 && this.renderForm() }
      </div>
    );
  }
  getValue(): Array<AnnouncementData> {
    return this.state.currentAnnouncements;
  }
}
