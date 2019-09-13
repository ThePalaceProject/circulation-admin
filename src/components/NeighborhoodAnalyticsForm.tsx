import * as React from "react";
import EditableInput from "./EditableInput";
import { Button, Form, Panel } from "library-simplified-reusable-components";
import { clearForm } from "../utils/sharedFunctions";
import { SettingData } from "../interfaces";
import { FetchErrorData } from "opds-web-client/lib/interfaces";

export interface NeighborhoodAnalyticsProps {
  setting: SettingData;
  disabled?: boolean;
  error?: FetchErrorData;
  currentValue?: string;
}

export interface NeighborhoodAnalyticsState {
  analyticsOption?: string;
}

export default class NeighborhoodAnalyticsForm extends React.Component<NeighborhoodAnalyticsProps, NeighborhoodAnalyticsState> {
  constructor(props) {
    super(props);
    this.state = { analyticsOption: props.currentValue || null };
    this.handleNeighborhoodChange = this.handleNeighborhoodChange.bind(this);
    this.renderNeighborhoodForm = this.renderNeighborhoodForm.bind(this);
  }

  render() {
    return (
      <Panel
        headerText="Patron Neighborhood Analytics"
        content={this.renderNeighborhoodForm()}
      />
    )
  }

  handleNeighborhoodChange(choice) {
    this.setState({ analyticsOption: choice });
  }

  renderNeighborhoodForm() {
    let setting = this.props.setting;
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
          this.state.analyticsOption && this.state.analyticsOption !== "disabled" &&
          <p>In order to use this feature, you must also enable it in your {setting.key === "location_source" ? <a href="/admin/web/config/patronAuth">patron authentication service configuration settings</a> : <a href="/admin/web/config/analytics">analytics service configuration settings</a>}.</p>
        }
      </fieldset>
    )
  }

  getValue(): string {
    return this.state.analyticsOption;
  }

}
