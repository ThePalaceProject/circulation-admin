import * as React from "react";
import * as PropTypes from "prop-types";
import EditableConfigList, {
  EditableConfigListStateProps,
  EditableConfigListDispatchProps,
  EditableConfigListOwnProps,
} from "./EditableConfigList";
import { connect } from "react-redux";
import ActionCreator from "../actions";
import {
  IndividualAdminsData,
  IndividualAdminData,
  AdminRoleData,
} from "../interfaces";
import Admin from "../models/Admin";
import IndividualAdminEditForm from "./IndividualAdminEditForm";

/** Right panel for individual admin configuration on the system configuration page.
    Shows a list of current individual admins and allows create a new admin or
    editing or deleting an existing admin. */
export class IndividualAdmins extends EditableConfigList<
  IndividualAdminsData,
  IndividualAdminData
> {
  EditForm = IndividualAdminEditForm;
  listDataKey = "individualAdmins";
  itemTypeName = "individual admin";
  urlBase = "/admin/web/config/individualAdmins/";
  identifierKey = "email";
  labelKey = "email";

  context: { admin: Admin };
  static contextTypes = {
    admin: PropTypes.object.isRequired,
  };

  private getRolesSummary(
    item: IndividualAdminData
  ): Array<{ label: string; suffix?: string; href?: string }> {
    const roles: AdminRoleData[] = item.roles || [];

    if (roles.some((r) => r.role === "system")) {
      return [{ label: "sysadmin" }];
    }

    const allLibraries: Array<{
      short_name: string;
      name?: string;
      uuid?: string;
    }> = (this.props.data as any)?.allLibraries || [];

    const getLibraryName = (shortName: string) =>
      allLibraries.find((l) => l.short_name === shortName)?.name || shortName;

    const getLibraryHref = (shortName: string) => {
      const uuid = allLibraries.find((l) => l.short_name === shortName)?.uuid;
      return uuid ? `/admin/web/config/libraries/edit/${uuid}` : undefined;
    };

    const result: Array<{ label: string; suffix?: string; href?: string }> = [];

    if (roles.some((r) => r.role === "manager-all")) {
      result.push({ label: "All libraries", suffix: " - Manager" });
    } else if (roles.some((r) => r.role === "librarian-all")) {
      result.push({ label: "All libraries", suffix: " - Librarian" });
    }

    const libraryHighestRole: Record<string, "manager" | "librarian"> = {};
    for (const r of roles) {
      if (r.library) {
        if (r.role === "manager") {
          libraryHighestRole[r.library] = "manager";
        } else if (
          r.role === "librarian" &&
          libraryHighestRole[r.library] !== "manager"
        ) {
          libraryHighestRole[r.library] = "librarian";
        }
      }
    }

    for (const [shortName, role] of Object.entries(libraryHighestRole)) {
      result.push({
        label: getLibraryName(shortName),
        suffix: role === "manager" ? " - Manager" : " - Librarian",
        href: getLibraryHref(shortName),
      });
    }

    result.sort((a, b) => a.label.localeCompare(b.label));
    return result;
  }

  protected getAssociatedItems(
    item: IndividualAdminData
  ): Array<any> | undefined {
    if (!item.roles) return undefined;
    return this.getRolesSummary(item);
  }

  protected formatAssociatedCount(count: number): string {
    return count === 0 ? "no roles" : count === 1 ? "1 role" : `${count} roles`;
  }

  protected renderAssociatedSection(item: IndividualAdminData): JSX.Element {
    const summary = this.getRolesSummary(item);
    return (
      <ul className="associated-libraries">
        {summary.map((entry, i) => (
          <li key={i}>
            {entry.href ? <a href={entry.href}>{entry.label}</a> : entry.label}
            {entry.suffix}
          </li>
        ))}
      </ul>
    );
  }

  canCreate() {
    return (
      this.context.admin && this.context.admin.isLibraryManagerOfSomeLibrary()
    );
  }

  canDelete() {
    return this.context.admin && this.context.admin.isSystemAdmin();
  }

  canEdit() {
    return (
      this.context.admin && this.context.admin.isLibraryManagerOfSomeLibrary()
    );
  }

  getHeaders() {
    const h2 = this.props.settingUp
      ? "Welcome!"
      : "Individual admin configuration";
    const h3 = this.props.settingUp
      ? "Set up your system admin account"
      : "Create a new individual admin";
    return { h2, h3 };
  }

  getClassName(): string {
    const className = this.props.settingUp ? "set-up" : "";
    return className;
  }

  save(data: FormData) {
    this.editItem(data).then(() => {
      // If we're setting up an admin for the first time, refresh the page
      // to go to login.
      if (this.props.settingUp) {
        window.location.reload();
        return;
      }
    });
  }
}

function mapStateToProps(state, ownProps) {
  const data = Object.assign(
    {},
    (state.editor.individualAdmins && state.editor.individualAdmins.data) || {}
  );
  if (state.editor.libraries && state.editor.libraries.data) {
    data.allLibraries = state.editor.libraries.data.libraries;
  }
  // fetchError = an error involving loading the list of individual admins; formError = an error upon submission of the
  // create/edit form.
  return {
    data: data,
    responseBody:
      state.editor.individualAdmins &&
      state.editor.individualAdmins.successMessage,
    fetchError: state.editor.individualAdmins.fetchError,
    formError: state.editor.individualAdmins.formError,
    isFetching:
      state.editor.individualAdmins.isFetching ||
      state.editor.individualAdmins.isEditing,
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  const actions = new ActionCreator(null, ownProps.csrfToken);
  return {
    fetchData: () => dispatch(actions.fetchIndividualAdmins()),
    editItem: (data: FormData) => dispatch(actions.editIndividualAdmin(data)),
    deleteItem: (identifier: string | number) =>
      dispatch(actions.deleteIndividualAdmin(identifier)),
  };
}

const ConnectedIndividualAdmins = connect<
  EditableConfigListStateProps<IndividualAdminsData>,
  EditableConfigListDispatchProps<IndividualAdminsData>,
  EditableConfigListOwnProps
>(
  mapStateToProps,
  mapDispatchToProps
)(IndividualAdmins);

export default ConnectedIndividualAdmins;
