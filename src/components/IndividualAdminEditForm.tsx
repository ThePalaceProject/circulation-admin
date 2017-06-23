import * as React from "react";
import EditableInput from "./EditableInput";
import { IndividualAdminsData, IndividualAdminData } from "../interfaces";

export interface IndividualAdminEditFormProps {
  data: IndividualAdminsData;
  item?: IndividualAdminData;
  csrfToken: string;
  disabled: boolean;
  editItem: (data: FormData) => Promise<void>;
  urlBase: string;
}

export interface IndividualAdminEditFormContext {
  settingUp: boolean;
}

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
        <input
          type="hidden"
          name="csrf_token"
          value={this.props.csrfToken}
          />
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
      if (!this.props.item && data.get("email")) {
        window.location.href = "/admin/web/config/individualAdmins/edit/" + data.get("email");
      }
    });
  }
}