import * as React from "react";
import EditableInput from "./EditableInput";
import { Button } from "library-simplified-reusable-components";

export interface AnnouncementFormProps {
  content?: string;
  startDate?: string;
  endDate?: string;
  position?: number;
  onChange?: () => void;
  add?: (announcement: any) => void;
}

export interface AnnouncementFormState {
  content?: string;
  startDate?: string;
  endDate?: string;
  position?: number;
}

export default class AnnouncementForm extends React.Component<AnnouncementFormProps, AnnouncementFormState>{
  constructor(props: AnnouncementFormProps) {
    super(props);
    this.updateStartDate = this.updateStartDate.bind(this);
    this.updateEndDate = this.updateEndDate.bind(this);
    // this.updatePosition = this.updatePosition.bind(this);
    this.state = {content: this.props.content || "", startDate: this.formatStartDate(this.props.startDate) || this.formatStartDate(), endDate: this.props.endDate || "", position: this.props.position || null};
  }
  formatStartDate(date?) {
    let today = new Date();
    let [month, day, year] = date?.split("/") || today.toLocaleDateString().split("/");
    return `${year}-${month.length === 1 ? "0" + month : month}-${day}`;
  }
  updateContent(content) {
    this.setState({ content });
  }
  updateStartDate(startDate) {
    this.setState({ startDate });
  }
  updateEndDate(endDate) {
    this.setState({ endDate });
  }

  add(e) {
    e.preventDefault();
    this.props.add({ content: this.state.content, startDate: this.state.startDate, endDate: this.state.endDate, position: this.state.position });
    this.setState({ content: "", startDate: "", endDate: "", position: null });
  }
  componentWillReceiveProps(newProps: AnnouncementFormProps) {
    if (newProps.content !== this.props.content) {
      this.setState({ content: newProps.content, startDate: this.formatStartDate(newProps.startDate), endDate: newProps.endDate });
    }
  }
  render(): JSX.Element {
    let sampleSetting = {
      description: "announcements",
      format: "date-range",
      key: "announcements",
      label: "Announcements",
      type: "list"
    }
    return (
      // <EditableInput elementType="select" name="position" label="Position" ref="position" value={this.state.position} onChange={(e) => this.updatePosition(e)}>
      // <option aria-selected={!this.state.position}></option>
      // <option aria-selected={this.state.position === 1}>1</option>
      // <option aria-selected={this.state.position === 2}>2</option>
      // <option aria-selected={this.state.position === 3}>3</option>
      // </EditableInput>
      <div>
        <EditableInput type="text" value={this.state.content} label="Content" optionalText={false} onChange={(e) => this.updateContent(e)} />
        <EditableInput type="date" max={this.state.endDate} value={this.state.startDate} label="Start" optionalText={false} onChange={(e) => this.updateStartDate(e)} description="If no start date is chosen, the default start date is today's date."/>
        <EditableInput type="date" min={this.state.startDate} value={this.state.endDate} label="End" optionalText={false} onChange={(e) => this.updateEndDate(e)} description="If no expiration date is chosen, the default expiration date is 2 months from the start date." />
        <Button callback={(e) => this.add(e)} className="left-align" content="Add" disabled={!(this.state.content && this.state.startDate && this.state.endDate && this.state.position)}/>
      </div>
    );
  }
}
