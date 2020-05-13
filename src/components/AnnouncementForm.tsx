import * as React from "react";
import EditableInput from "./EditableInput";
import { Button } from "library-simplified-reusable-components";

export interface AnnouncementFormProps {
  content?: string;
  startDate?: string;
  endDate?: string;
  onChange?: () => void;
  add?: (announcement: any) => void;
}

export interface AnnouncementFormState {
  content?: string;
  startDate?: string;
  endDate?: string;
}

export default class AnnouncementForm extends React.Component<AnnouncementFormProps, AnnouncementFormState>{
  constructor(props: AnnouncementFormProps) {
    super(props);
    this.updateStartDate = this.updateStartDate.bind(this);
    this.updateEndDate = this.updateEndDate.bind(this);
    this.getValue = this.getValue.bind(this);
    this.state = {content: this.props.content || "", startDate: this.props.startDate || "", endDate: this.props.endDate || ""};
  }
  updateContent(content) {
    this.setState({ content });
    this.props.onChange();
  }
  updateStartDate(startDate) {
    this.setState({ startDate });
    this.props.onChange();
  }
  updateEndDate(endDate) {
    this.setState({ endDate });
    this.props.onChange();
  }
  add(e) {
    e.preventDefault();
    this.props.add({ content: this.state.content, startDate: this.state.startDate, endDate: this.state.endDate });
    this.setState({ content: "", startDate: "", endDate: "" });
  }
  componentWillReceiveProps(newProps: AnnouncementFormProps) {
    if (newProps.content !== this.props.content) {
      this.setState({ content: newProps.content, startDate: newProps.startDate, endDate: newProps.endDate });
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
      <div className="">
        <EditableInput type="text" value={this.state.content} label="Content" optionalText={false} onChange={(e) => this.updateContent(e)} />
        <EditableInput type="date" max={this.state.endDate} value={this.state.startDate} label="Start" optionalText={false} onChange={(e) => this.updateStartDate(e)} />
        <EditableInput type="date" min={this.state.startDate} value={this.state.endDate} label="End" optionalText={false} onChange={(e) => this.updateEndDate(e)} />
        <Button callback={(e) => this.add(e)} className="left-align" content="Add" disabled={!(this.state.content && this.state.startDate && this.state.endDate)}/>
      </div>
    );
  }
  getValue() {
    return `${this.state.content}: ${this.state.startDate} to ${this.state.endDate}`;
  }
}
