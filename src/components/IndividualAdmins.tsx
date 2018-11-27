import * as React from "react";
import EditableConfigList, { EditableConfigListStateProps, EditableConfigListDispatchProps, EditableConfigListOwnProps } from "./EditableConfigList";
import { connect } from "react-redux";
import ActionCreator from "../actions";
import { IndividualAdminsData, IndividualAdminData } from "../interfaces";
import Admin from "../models/Admin";
import IndividualAdminEditForm from "./IndividualAdminEditForm";

/** Right panel for individual admin configuration on the system configuration page.
    Shows a list of current individual admins and allows create a new admin or
    editing or deleting an existing admin. */
export class IndividualAdmins extends EditableConfigList<IndividualAdminsData, IndividualAdminData> {
  EditForm = IndividualAdminEditForm;
  listDataKey = "individualAdmins";
  itemTypeName = "individual admin";
  urlBase = "/admin/web/config/individualAdmins/";
  identifierKey = "email";
  labelKey = "email";

  context: { admin: Admin };
  static contextTypes = {
    admin: React.PropTypes.object.isRequired
  };

  canDelete(item) {
    return this.context.admin && this.context.admin.isSystemAdmin();
  }

  getHeaders() {
    let h2 = this.props.settingUp ? "Welcome!" : "Individual admin configuration";
    let h3 = this.props.settingUp ? "Set up your system admin account" : "Create a new individual admin";
    return { h2, h3 };
  }

  getClassName() {
    let className = this.props.settingUp ? "set-up" : "";
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
  const data = Object.assign({}, state.editor.individualAdmins && state.editor.individualAdmins.data || {});
  if (state.editor.libraries && state.editor.libraries.data) {
    data.allLibraries = state.editor.libraries.data.libraries;
  }
  // fetchError = an error involving loading the list of individual admins; formError = an error upon submission of the 
  // create/edit form.
  return {
    data: data,
    responseBody: state.editor.individualAdmins && state.editor.individualAdmins.successMessage,
    fetchError: state.editor.individualAdmins.fetchError,
    formError: state.editor.individualAdmins.formError,
    isFetching: state.editor.individualAdmins.isFetching || state.editor.individualAdmins.isEditing
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  let actions = new ActionCreator(null, ownProps.csrfToken);
  return {
    fetchData: () => dispatch(actions.fetchIndividualAdmins()),
    editItem: (data: FormData) => dispatch(actions.editIndividualAdmin(data)),
    deleteItem: (identifier: string | number) => dispatch(actions.deleteIndividualAdmin(identifier)),
  };
}

const ConnectedIndividualAdmins = connect<EditableConfigListStateProps<IndividualAdminsData>, EditableConfigListDispatchProps<IndividualAdminsData>, EditableConfigListOwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(IndividualAdmins);

export default ConnectedIndividualAdmins;
