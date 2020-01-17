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
  constructor(props: NeighborhoodAnalyticsFormProps) {
    super(props);
    this.state = { selected: props.currentValue || "" };
    this.handleNeighborhoodChange = this.handleNeighborhoodChange.bind(this);
    this.renderNeighborhoodForm = this.renderNeighborhoodForm.bind(this);
  }

  render(): JSX.Element {
    return (
      <Panel
        headerText={`Patron Neighborhood Analytics: ${this.isEnabled() ? "En" : "Dis"}abled`}
        content={this.renderNeighborhoodForm()}
        id="neighborhood"
      />
    );
  }

  isEnabled(): boolean {
    return (this.state.selected && this.state.selected !== "disabled");
  }

  handleNeighborhoodChange(choice: string) {
    this.setState({ selected: choice });
  }

  renderNeighborhoodForm(): JSX.Element {
    let setting: SettingData = this.props.setting;
    let [url, name]: string[] = this.getPairedService(setting);
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
          this.isEnabled() &&
          <p className="bg-warning">This feature will work only if it is also enabled in your <a href={url}>{name}</a>.</p>
        }
      </fieldset>
    );
  }

  getPairedService(setting: SettingData): string[] {
    // Whichever type of service we're currently dealing with--patron authentication or analytics--we need to provide a link to the other one.
    const services = { "patronAuth": "patron authentication", "analytics": "local analytics" };
    let targetService = setting.key === "location_source" ? "patronAuth" : "analytics";
    let url = "/admin/web/config/" + targetService;
    let name = services[targetService] + " service configuration settings";
    return [url, name];
  }

  getValue(): string {
    return this.state.selected;
  }
}
