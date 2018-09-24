import * as React from "react";
import EditableInput from "./EditableInput";
import SaveButton from "./SaveButton";
import { IndividualAdminsData, IndividualAdminData } from "../interfaces";
import Admin from "../models/Admin";

export interface IndividualAdminEditFormProps {
  data: IndividualAdminsData;
  item?: IndividualAdminData;
  disabled: boolean;
  editItem: (data: FormData) => Promise<void>;
  urlBase: string;
  listDataKey: string;
  responseBody?: string;
}

export interface IndividualAdminEditFormState {
  admin: Admin;
}

export interface IndividualAdminEditFormContext {
  settingUp: boolean;
  admin: Admin;
}

/** Form for editing an individual admin from the individual admin configuration page. */
export default class IndividualAdminEditForm extends React.Component<IndividualAdminEditFormProps, IndividualAdminEditFormState> {
  context: IndividualAdminEditFormContext;

  static contextTypes: React.ValidationMap<IndividualAdminEditFormContext> = {
    settingUp: React.PropTypes.bool.isRequired,
    admin: React.PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      admin: new Admin(this.props.item && this.props.item.roles || [])
    };
    this.isSelected = this.isSelected.bind(this);
    this.handleRoleChange = this.handleRoleChange.bind(this);
    this.save = this.save.bind(this);
    this.handleData = this.handleData.bind(this);
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
        { this.canChangePassword() &&
          <EditableInput
            elementType="input"
            type="text"
            disabled={this.props.disabled}
            name="password"
            label="Password"
            />
        }
        { !this.context.settingUp &&
          <div>
            <h4>Roles</h4>
            <EditableInput
              elementType="input"
              type="checkbox"
              disabled={this.isDisabled("system")}
              name="system"
              label="System Admin"
              checked={this.isSelected("system")}
              onChange={() => this.handleRoleChange("system")}
              />
            <table className="library-admin-roles">
              <thead>
                <tr>
                  <th></th>
                  <th>
                    <EditableInput
                       elementType="input"
                       type="checkbox"
                       disabled={this.isDisabled("manager-all")}
                       name="manager-all"
                       label="Library Manager"
                       checked={this.isSelected("manager-all")}
                       onChange={() => this.handleRoleChange("manager-all")}
                    />
                  </th>
                  <th>
                    <EditableInput
                      elementType="input"
                      type="checkbox"
                      disabled={this.isDisabled("librarian-all")}
                      name="librarian-all"
                      label="Librarian"
                      checked={this.isSelected("librarian-all")}
                      onChange={() => this.handleRoleChange("librarian-all")}
                      />
                  </th>
                </tr>
              </thead>
              <tbody>
                { this.props.data && this.props.data.allLibraries && this.props.data.allLibraries.map(library =>
                  <tr key={library.short_name}>
                    <td>
                      {library.name}
                    </td>
                    <td>
                      <EditableInput
                        elementType="input"
                        type="checkbox"
                        disabled={this.isDisabled("manager", library.short_name)}
                        name={"manager-" + library.short_name}
                        label=""
                        checked={this.isSelected("manager", library.short_name)}
                        onChange={() => this.handleRoleChange("manager", library.short_name)}
                        />
                    </td>
                    <td>
                      <EditableInput
                        elementType="input"
                        type="checkbox"
                        disabled={this.isDisabled("librarian", library.short_name)}
                        name={"librarian-" + library.short_name}
                        label=""
                        checked={this.isSelected("librarian", library.short_name)}
                        onChange={() => this.handleRoleChange("librarian", library.short_name)}
                        />
                    </td>
                  </tr>
                ) }
              </tbody>
            </table>
          </div>
        }
        <SaveButton
          disabled={this.props.disabled}
          save={this.save}
          handleData={this.handleData}
          form={this.refs["form"]}
        />
      </form>
    );
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.item && nextProps.item !== this.props.item) {
      this.setState({ admin: new Admin(nextProps.item.roles || []) });
    }
  }

  canChangePassword() {
    if (!this.props.item || !this.props.item.roles) {
      return true;
    }
    if (this.props.item.roles.length === 0) {
      return this.context.admin.isLibraryManagerOfSomeLibrary();
    }
    let targetAdmin = new Admin(this.props.item.roles || []);
    if (targetAdmin.isSystemAdmin()) {
      return this.context.admin.isSystemAdmin();
    } else if (targetAdmin.isSitewideLibraryManager()) {
      return this.context.admin.isSitewideLibraryManager();
    } else {
      for (const role of targetAdmin.roles) {
        if (this.context.admin.isLibraryManager(role.library)) {
          return true;
        }
      }
      return false;
    }
  }

  isSelected(role: string, library?: string) {
    return this.state.admin.hasRole(role, library);
  }

  isDisabled(role: string, library?: string) {
    if (this.props.disabled) {
      return true;
    }
    if (role === "system" || this.isSelected("system")) {
      return !this.context.admin.isSystemAdmin();
    }
    if (role === "manager-all" || role === "librarian-all") {
      return !this.context.admin.isSitewideLibraryManager();
    }
    if (role === "manager") {
      if (this.isSelected("manager-all")) {
        return !this.context.admin.isSitewideLibraryManager();
      }
      return !this.context.admin.isLibraryManager(library);
    }
    if (role === "librarian") {
      if (this.isSelected("librarian-all")) {
        return !this.context.admin.isSitewideLibraryManager();
      }
      return !this.context.admin.isLibraryManager(library);
    }
  }

  handleRoleChange(role: string, library?: string) {
    if (role === "system") {
      if (this.isSelected(role)) {
        this.setState(Object.assign({}, this.state, { admin: new Admin([]) }));
      } else {
        this.setState(Object.assign({}, this.state, { admin: new Admin([{ role }]) }));
      }
    } else if (role === "manager-all") {
      if (this.isSelected(role)) {
        this.setState(Object.assign({}, this.state, { admin: new Admin([{ role: "librarian-all" }]) }));
      } else {
        this.setState(Object.assign({}, this.state, { admin: new Admin([{ role: "manager-all" }]) }));
      }
    } else if (role === "librarian-all") {
      if (this.isSelected(role)) {
        // Remove librarian-all role, but leave manager roles.
        const roles = this.state.admin.roles.filter(stateRole => stateRole.role === "manager");
        this.setState(Object.assign({}, this.state, { admin: new Admin(roles) }));
      } else {
        // Remove old librarian roles, but leave manager roles.
        const roles = this.state.admin.roles.filter(stateRole => stateRole.role === "manager");
        roles.push({ role: "librarian-all" });
        this.setState(Object.assign({}, this.state, { admin: new Admin(roles) }));
      }
    } else if (role === "manager") {
      if (this.isSelected(role, library)) {
        // Remove the manager role for this library, and add the librarian role.
        // If manager-all was selected, remove it and add individual manager
        // roles for other libraries and the librarian-all role.
        if (this.isSelected("manager-all")) {
          const roles = [];
          for (const l of this.props.data.allLibraries || []) {
            if (l.short_name !== library) {
              roles.push({ role: "manager", library: l.short_name });
            }
          }
          roles.push({ role: "librarian-all" });
          this.setState(Object.assign({}, this.state, { admin: new Admin(roles) }));
        } else {
          // Remove the manager role for this library and add the librarian role,
          // unless librarian-all is already selected.
          const roles = this.state.admin.roles.filter(stateRole => stateRole.library !== library);
          if (!this.isSelected("librarian-all")) {
            roles.push({ role: "librarian", library: library });
          }
          this.setState(Object.assign({}, this.state, { admin: new Admin(roles) }));
        }
      } else {
        // Add the manager role for the library, and remove the librarian role if it was
        // there.
        const roles = this.state.admin.roles.filter(stateRole => stateRole.library !== library);
        roles.push({ role: "manager", library: library });
        this.setState(Object.assign({}, this.state, { admin: new Admin(roles) }));
      }
    } else if (role === "librarian") {
      if (this.isSelected(role, library)) {
        // Remove the librarian role for this library, and the manager role if it was
        // selected. If any 'all' roles were selected, remove them and add roles for
        // individual libraries.
        if (this.isSelected("librarian-all")) {
           if (this.isSelected("manager-all")) {
             const roles = [];
             for (const l of this.props.data.allLibraries || []) {
               if (l.short_name !== library) {
                 roles.push({ role: "manager", library: l.short_name });
               }
             }
             this.setState(Object.assign({}, this.state, { admin: new Admin(roles) }));
           } else if (this.isSelected("librarian-all")) {
             const roles = this.state.admin.roles.filter(stateRole => (stateRole.role === "manager" && stateRole.library !== library));
             for (const l of this.props.data.allLibraries || []) {
               if (l.short_name !== library) {
                 roles.push({ role: "librarian", library: l.short_name });
               }
             }
             this.setState(Object.assign({}, this.state, { admin: new Admin(roles) }));
           }
        } else {
          const roles = this.state.admin.roles.filter(stateRole => stateRole.library !== library);
          this.setState(Object.assign({}, this.state, { admin: new Admin(roles) }));
        }
      } else {
          const roles = this.state.admin.roles;
          roles.push({ role, library });
          this.setState(Object.assign({}, this.state, { admin: new Admin(roles) }));
      }
    }
  }

  handleData(data) {
    let roles = this.state.admin.roles;
    if (this.context && this.context.settingUp) {
      // When setting up the only thing you can do is create a system admin.
      roles = [{ role: "system" }];
    }
    data.append("roles", JSON.stringify(roles));
  }

  save(data) {
    this.props.editItem(data).then(() => {
        // If we're setting up an admin for the first time, refresh the page
        // to go to login.
      if (this.context.settingUp) {
        window.location.reload();
        return;
      }
    });
  }


}
