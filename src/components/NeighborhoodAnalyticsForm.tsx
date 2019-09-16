import * as React from "react";
import EditableInput from "./EditableInput";
import { Panel } from "library-simplified-reusable-components";
import { SettingData } from "../interfaces";
import { FetchErrorData } from "opds-web-client/lib/interfaces";

export interface NeighborhoodAnalyticsFormProps {
  setting: SettingData;
  disabled?: boolean;
  error?: FetchErrorData;
  currentValue?: string;
}

export interface NeighborhoodAnalyticsFormState {
  selected?: string;
}

export default class NeighborhoodAnalyticsForm extends React.Component<NeighborhoodAnalyticsFormProps, NeighborhoodAnalyticsFormState> {
  constructor(props) {
    super(props);
    this.state = { selected: props.currentValue || null };
    this.handleNeighborhoodChange = this.handleNeighborhoodChange.bind(this);
    this.renderNeighborhoodForm = this.renderNeighborhoodForm.bind(this);
  }

  render() {
    return (
      <Panel
        headerText={`Patron Neighborhood Analytics: ${this.state.selected && this.state.selected !== "disabled" ? "En" : "Dis"}abled`}
        content={this.renderNeighborhoodForm()}
      />
    )
  }

  handleNeighborhoodChange(choice) {
    this.setState({ selected: choice });
  }

  renderNeighborhoodForm() {
    let setting = this.props.setting;
    let [oppositeKey, oppositeName] = this.getPairedService(setting);
    return (
      <fieldset>
        <legend className="visuallyHidden">Patron Neighborhood Analytics</legend>
        <p dangerouslySetInnerHTML={{__html: setting.description}}/>
        <EditableInput
          key={setting.key}
          label={setting.label}
          elementType="select"
          disabled={this.props.disabled}
          value={this.props.currentValue}
          error={this.props.error}
          onChange={this.handleNeighborhoodChange}
        >
        { setting.options.map(o =>
            <option key={o.key} value={o.key} aria-selected={o.key === this.props.currentValue}>
              {o.label}
            </option>
          )
        }
        </EditableInput>
        {
          this.state.selected && this.state.selected !== "disabled" &&
          <p>This feature will work only if it is also enabled in your <a href={"/admin/web/config/" + oppositeKey}>{oppositeName} service configuration settings</a>.</p>
        }
      </fieldset>
    )
  }

  getPairedService(setting): string[] {
    return setting.key === "location_source" ?
      ["patronAuth", "patron authentication"] :
      ["analytics", "analytics"];
  }

  getValue(): string {
    return this.state.selected;
  }
}
