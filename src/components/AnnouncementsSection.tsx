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
  editing?: any;
}

export default class AnnouncementsSection extends React.Component<AnnouncementsSectionProps, AnnouncementsSectionState> {
  constructor(props: AnnouncementsSectionProps) {
    super(props);
    this.addAnnouncement = this.addAnnouncement.bind(this);
    this.deleteAnnouncement = this.deleteAnnouncement.bind(this);
    this.editAnnouncement = this.editAnnouncement.bind(this);
    this.getValue = this.getValue.bind(this);
    this.state = { currentAnnouncements: Array.isArray(this.props.value) ? this.props.value : [] };
  }
  addAnnouncement(announcement: AnnouncementData) {
    let announcements = this.state.currentAnnouncements;
    this.setState({ currentAnnouncements: announcements.concat(announcement) });
  }
  deleteAnnouncement(id: string) {
    if (window.confirm("This will remove this announcement from your list. Are you sure you want to continue?")) {
      this.setState({ currentAnnouncements: this.state.currentAnnouncements.filter(a => a.id !== id), editing: null});
    }
  }
  async editAnnouncement(id: string) {
    await this.setState({ editing: this.state.currentAnnouncements.find(a => a.id === id), currentAnnouncements: this.state.currentAnnouncements.filter(a => a.id !== id) });
  }
  renderAnnouncement(a: AnnouncementData): JSX.Element {
    return (
      <Announcement
        key={a.content}
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
              <li key={a.content}>
                {this.renderAnnouncement(a)}
              </li>
          )
        }
      </ul>
    );
  }
  render(): JSX.Element {
    return (
      <div className="announcements-section">
        { this.state.currentAnnouncements.length > 0 && this.renderList() }
        { this.state.currentAnnouncements.length < 3 && <AnnouncementForm add={this.addAnnouncement} content={this.state.editing?.content} start={this.state.editing?.start} finish={this.state.editing?.finish} /> }
      </div>
    );
  }
  getValue(): Array<AnnouncementData> {
    return this.state.currentAnnouncements;
  }
}
