import * as React from "react";
import EditableInput from "./EditableInput";
import { IndividualAdminsData, IndividualAdminData } from "../interfaces";

export interface IndividualAdminEditFormProps {
  data: IndividualAdminsData;
  item?: IndividualAdminData;
  disabled: boolean;
  editItem: (data: FormData) => Promise<void>;
  urlBase: string;
  listDataKey: string;
  editedIdentifier?: string;
}

export interface IndividualAdminEditFormContext {
  settingUp: boolean;
}

/** Form for editing an individual admin from the individual admin configuration page. */
export default class IndividualAdminEditForm extends React.Component<IndividualAdminEditFormProps, void> {
  context: IndividualAdminEditFormContext;

  static contextTypes: React.ValidationMap<IndividualAdminEditFormContext> = {
    settingUp: React.PropTypes.bool.isRequired
  };

  constructor(props) {
    super(props);
    this.save = this.save.bind(this);
  }

  render(): JSX.Element {
    return (
      <form ref="form" onSubmit={this.save} className="edit-form">
        <EditableInput
          elementType="input"
          type="text"
          disabled={this.props.disabled}
          readOnly={!!(this.props.item && this.props.item.email)}
          name="email"
          label="Email"
          value={this.props.item && this.props.item.email}
          />
        <EditableInput
          elementType="input"
          type="text"
          disabled={this.props.disabled}
          name="password"
          label="Password"
          />
        <button
          type="submit"
          className="btn btn-default"
          disabled={this.props.disabled}
          >Submit</button>
      </form>
    );
  }

  save(event) {
    event.preventDefault();
    const data = new (window as any).FormData(this.refs["form"] as any);
    this.props.editItem(data).then(() => {
      // If we're setting up an admin for the first time, refresh the page
      // to go to login.
      if (this.context.settingUp) {
        window.location.reload();
        return;
      }

      // If a new admin was created, go to its edit page.
      if (!this.props.item && this.props.editedIdentifier) {
        window.location.href = this.props.urlBase + "edit/" + this.props.editedIdentifier;
      }
    });
  }
}