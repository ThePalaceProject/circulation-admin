import * as React from "react";
import * as PropTypes from "prop-types";
import EditableInput from "./EditableInput";
import { clearForm } from "../utils/sharedFunctions";
import { IndividualAdminsData, IndividualAdminData } from "../interfaces";
import Admin from "../models/Admin";
import { Panel, Form } from "library-simplified-reusable-components";

import { FetchErrorData } from "@thepalaceproject/web-opds-client/lib/interfaces";

export interface IndividualAdminEditFormProps {
  data: IndividualAdminsData;
  item?: IndividualAdminData;
  disabled: boolean;
  save?: (data: FormData) => void;
  urlBase: string;
  listDataKey: string;
  responseBody?: string;
  error?: FetchErrorData;
}

export interface IndividualAdminEditFormState {
  admin: Admin;
}

export interface IndividualAdminEditFormContext {
  settingUp: boolean;
  admin: Admin;
}

/** Form for editing an individual admin from the individual admin configuration page. */
export default class IndividualAdminEditForm extends React.Component<
  IndividualAdminEditFormProps,
  IndividualAdminEditFormState
> {
  context: IndividualAdminEditFormContext;

  static contextTypes: React.ValidationMap<IndividualAdminEditFormContext> = {
    settingUp: PropTypes.bool.isRequired,
    admin: PropTypes.object.isRequired as React.Validator<Admin>,
  };
  private emailRef = React.createRef<EditableInput>();
  private passwordRef = React.createRef<EditableInput>();
  private systemRef = React.createRef<EditableInput>();
  private managerAllRef = React.createRef<EditableInput>();
  private librarianAllRef = React.createRef<EditableInput>();
  private libraryManagerRefs = {};
  private librarianRefs = {};

  constructor(props) {
    super(props);
    this.state = {
      admin: new Admin((this.props.item && this.props.item.roles) || []),
    };
    this.isSelected = this.isSelected.bind(this);
    this.handleRoleChange = this.handleRoleChange.bind(this);
    this.handleData = this.handleData.bind(this);
    this.submit = this.submit.bind(this);
    this.renderForm = this.renderForm.bind(this);
    this.renderRoleForm = this.renderRoleForm.bind(this);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.item && nextProps.item !== this.props.item) {
      this.setState({ admin: new Admin(nextProps.item.roles || []) });
    }
    if (nextProps.responseBody && !nextProps.fetchError) {
      [
        this.emailRef,
        this.passwordRef,
        this.systemRef,
        this.managerAllRef,
        this.librarianAllRef,
      ].forEach((ref) => clearForm(ref));

      clearForm(this.librarianRefs);
      clearForm(this.libraryManagerRefs);
    }
  }

  render(): JSX.Element {
    return (
      <Form
        onSubmit={this.submit}
        className="edit-form"
        disableButton={this.props.disabled}
        withoutButton={!this.props.save}
        content={[
          <Panel
            headerText="Admin Information"
            id="admin-info"
            key="info"
            content={this.renderForm()}
            openByDefault={true}
            collapsible={!this.context.settingUp}
            onEnter={this.submit}
          />,
          !this.context.settingUp && (
            <Panel
              id="admin-roles"
              headerText="Admin Roles"
              key="roles"
              content={this.renderRoleForm()}
              openByDefault={true}
              onEnter={this.submit}
            />
          ),
        ]}
      />
    );
  }

  renderForm() {
    return (
      <fieldset>
        <legend className="visuallyHidden">Admin information</legend>
        <EditableInput
          elementType="input"
          type="text"
          disabled={this.props.disabled}
          required={true}
          readOnly={!!(this.props.item && this.props.item.email)}
          name="email"
          label="Email"
          ref={this.emailRef}
          value={this.props.item && this.props.item.email}
          error={this.props.error}
        />
        {this.canChangePassword() && (
          <EditableInput
            elementType="input"
            type="text"
            disabled={this.props.disabled}
            name="password"
            label="Password"
            ref={this.passwordRef}
            required={this.context.settingUp}
            error={this.props.error}
          />
        )}
      </fieldset>
    );
  }

  renderRoleForm() {
    return (
      <fieldset>
        <legend className="visuallyHidden">Roles</legend>
        <EditableInput
          elementType="input"
          type="checkbox"
          disabled={this.isDisabled("system")}
          name="system"
          ref={this.systemRef}
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
                  ref={this.managerAllRef}
                  label="Administrator"
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
                  ref={this.librarianAllRef}
                  label="User"
                  checked={this.isSelected("librarian-all")}
                  onChange={() => this.handleRoleChange("librarian-all")}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {this.props.data &&
              this.props.data.allLibraries &&
              this.props.data.allLibraries.map((library) => (
                <tr key={library.short_name}>
                  <td>{library.name}</td>
                  <td>
                    <EditableInput
                      elementType="input"
                      type="checkbox"
                      disabled={this.isDisabled("manager", library.short_name)}
                      name={"manager-" + library.short_name}
                      ref={(componentInstance) => {
                        this.libraryManagerRefs[
                          library.short_name
                        ] = componentInstance;
                      }}
                      label=""
                      aria-label={`Administrator of ${library.short_name}`}
                      checked={this.isSelected("manager", library.short_name)}
                      onChange={() =>
                        this.handleRoleChange("manager", library.short_name)
                      }
                    />
                  </td>
                  <td>
                    <EditableInput
                      elementType="input"
                      type="checkbox"
                      disabled={this.isDisabled(
                        "librarian",
                        library.short_name
                      )}
                      name={"librarian-" + library.short_name}
                      ref={(componentInstance) => {
                        this.librarianRefs[
                          library.short_name
                        ] = componentInstance;
                      }}
                      label=""
                      aria-label={`User of ${library.short_name}`}
                      checked={this.isSelected("librarian", library.short_name)}
                      onChange={() =>
                        this.handleRoleChange("librarian", library.short_name)
                      }
                    />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </fieldset>
    );
  }

  canChangePassword() {
    if (this.context.settingUp || !this.props.item || !this.props.item.roles) {
      return true;
    }
    if (this.props.item.roles.length === 0) {
      return this.context.admin.isLibraryManagerOfSomeLibrary();
    }
    const targetAdmin = new Admin(this.props.item.roles || []);
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
        this.setState(
          Object.assign({}, this.state, { admin: new Admin([{ role }]) })
        );
      }
    } else if (role === "manager-all") {
      if (this.isSelected(role)) {
        this.setState(
          Object.assign({}, this.state, {
            admin: new Admin([{ role: "librarian-all" }]),
          })
        );
      } else {
        this.setState(
          Object.assign({}, this.state, {
            admin: new Admin([{ role: "manager-all" }]),
          })
        );
      }
    } else if (role === "librarian-all") {
      if (this.isSelected(role)) {
        // Remove librarian-all role, but leave manager roles.
        const roles = this.state.admin.roles.filter(
          (stateRole) => stateRole.role === "manager"
        );
        this.setState(
          Object.assign({}, this.state, { admin: new Admin(roles) })
        );
      } else {
        // Remove old librarian roles, but leave manager roles.
        const roles = this.state.admin.roles.filter(
          (stateRole) => stateRole.role === "manager"
        );
        roles.push({ role: "librarian-all" });
        this.setState(
          Object.assign({}, this.state, { admin: new Admin(roles) })
        );
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
          this.setState(
            Object.assign({}, this.state, { admin: new Admin(roles) })
          );
        } else {
          // Remove the manager role for this library and add the librarian role,
          // unless librarian-all is already selected.
          const roles = this.state.admin.roles.filter(
            (stateRole) => stateRole.library !== library
          );
          if (!this.isSelected("librarian-all")) {
            roles.push({ role: "librarian", library: library });
          }
          this.setState(
            Object.assign({}, this.state, { admin: new Admin(roles) })
          );
        }
      } else {
        // Add the manager role for the library, and remove the librarian role if it was
        // there.
        const roles = this.state.admin.roles.filter(
          (stateRole) => stateRole.library !== library
        );
        roles.push({ role: "manager", library: library });
        this.setState(
          Object.assign({}, this.state, { admin: new Admin(roles) })
        );
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
            this.setState(
              Object.assign({}, this.state, { admin: new Admin(roles) })
            );
          } else if (this.isSelected("librarian-all")) {
            const roles = this.state.admin.roles.filter(
              (stateRole) =>
                stateRole.role === "manager" && stateRole.library !== library
            );
            for (const l of this.props.data.allLibraries || []) {
              if (l.short_name !== library) {
                roles.push({ role: "librarian", library: l.short_name });
              }
            }
            this.setState(
              Object.assign({}, this.state, { admin: new Admin(roles) })
            );
          }
        } else {
          const roles = this.state.admin.roles.filter(
            (stateRole) => stateRole.library !== library
          );
          this.setState(
            Object.assign({}, this.state, { admin: new Admin(roles) })
          );
        }
      } else {
        const roles = this.state.admin.roles;
        roles.push({ role, library });
        this.setState(
          Object.assign({}, this.state, { admin: new Admin(roles) })
        );
      }
    }
  }

  handleData(data: FormData) {
    let roles = this.state.admin.roles;
    if (this.context && this.context.settingUp) {
      // When setting up the only thing you can do is create a system admin.
      roles = [{ role: "system" }];
    }
    data && data.append("roles", JSON.stringify(roles));
    return data;
  }

  async submit(data: FormData) {
    if (this.props.save) {
      const modifiedData = this.handleData(data);
      await this.props.save(modifiedData);
    }
  }
}
