import * as React from "react";
import EditableInput from "./EditableInput";
import { Button } from "library-simplified-reusable-components";

export interface AnnouncementFormProps {
  content?: string;
  start?: string;
  finish?: string;
  id?: number;
  add: (announcement: any) => void;
}

export interface AnnouncementFormState {
  content?: string;
  start?: string;
  finish?: string;
  id?: number;
}

export default class AnnouncementForm extends React.Component<AnnouncementFormProps, AnnouncementFormState> {
  constructor(props: AnnouncementFormProps) {
    super(props);
    this.updateStartDate = this.updateStartDate.bind(this);
    this.updateEndDate = this.updateEndDate.bind(this);
    let [start, finish] = this.getDefaultDates();
    this.state = {content: "", start: start, finish: finish};
  }
  getDefaultDates(): string[] {
    let today = new Date();
    let start = this.formatDate(today);
    let finish = this.formatDate(new Date(today.setMonth(today.getMonth() + 2)));
    return [start, finish];
  }
  formatDate(date: Date): string {
    let [month, day, year] = date.toLocaleDateString().split("/");
    return `${year}-${month.toString().length === 1 ? "0" + month : month}-${day.toString().length === 1 ? "0" + day : day}`;
  }
  updateContent(content: string) {
    this.setState({ content });
  }
  updateStartDate(start: string) {
    this.setState({ start });
  }
  updateEndDate(finish: string) {
    this.setState({ finish });
  }
  add(e) {
    e.preventDefault();
    this.props.add({ content: this.state.content, start: this.state.start, finish: this.state.finish });
    let [start, finish] = this.getDefaultDates();
    this.setState({content: "", start: start, finish: finish});
  }
  cancel(e) {
    e.preventDefault();
    if (this.props.content) {
      this.add(e);
    } else {
      let [start, finish] = this.getDefaultDates();
      this.setState({content: "", start: start, finish: finish});
    }
  }
  componentWillReceiveProps(newProps: AnnouncementFormProps) {
    if (newProps.content !== this.props.content) {
      this.setState({ content: newProps.content, start: this.formatDate(new Date(newProps.start)), finish: this.formatDate(new Date(newProps.finish)) });
    }
  }
  render(): JSX.Element {
    let shouldDisable = () => {
      if (!this.state.content || !this.state.start || !this.state.finish) {
        return true;
      } else if (this.state.content.length < 15 || this.state.content.length > 350) {
        return true;
      }
      return false;
    };
    return (
      <div className="announcement-form">
        <EditableInput className={(this.state.content.length < 15 || this.state.content.length >= 350) && "wrong-length"} elementType="textarea" type="text" minLength={15} maxLength={350} value={this.state.content} label="Content (15-350 characters)" optionalText={false} onChange={(e) => this.updateContent(e)} description={`(${this.state.content.length}/350)`} />
        <EditableInput
          type="date"
          max={this.state.finish}
          value={this.state.start}
          label="Start"
          optionalText={true}
          onChange={(e) => this.updateStartDate(e)}
          description="If no start date is chosen, the default start date is today's date."
        />
        <EditableInput
          type="date"
          min={this.state.start}
          value={this.state.finish}
          label="End"
          optionalText={true}
          onChange={(e) => this.updateEndDate(e)}
          description="If no expiration date is chosen, the default expiration date is 2 months from the start date."
        />
        <Button callback={(e) => this.add(e)} className="inline left-align" disabled={shouldDisable()}/>
        <Button callback={(e) => this.cancel(e)} content="Cancel" className="inline left-align" />
      </div>
    );
  }
}
