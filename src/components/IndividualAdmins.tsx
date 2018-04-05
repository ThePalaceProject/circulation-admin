import EditableConfigList, { EditableConfigListStateProps, EditableConfigListDispatchProps, EditableConfigListOwnProps } from "./EditableConfigList";
import { connect } from "react-redux";
import ActionCreator from "../actions";
import { IndividualAdminsData, IndividualAdminData } from "../interfaces";
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
}

function mapStateToProps(state, ownProps) {
  const data = Object.assign({}, state.editor.individualAdmins && state.editor.individualAdmins.data || {});
  if (state.editor.libraries && state.editor.libraries.data) {
    data.allLibraries = state.editor.libraries.data.libraries;
  }
  return {
    data: data,
    editedIdentifier: state.editor.individualAdmins && state.editor.individualAdmins.editedIdentifier,
    fetchError: state.editor.individualAdmins.fetchError,
    isFetching: state.editor.individualAdmins.isFetching || state.editor.individualAdmins.isEditing
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  let actions = new ActionCreator(null, ownProps.csrfToken);
  return {
    fetchData: () => dispatch(actions.fetchIndividualAdmins()),
    editItem: (data: FormData) => dispatch(actions.editIndividualAdmin(data)),
    deleteItem: (identifier: string | number) => dispatch(actions.deleteIndividualAdmin(identifier))
  };
}

const ConnectedIndividualAdmins = connect<EditableConfigListStateProps<IndividualAdminsData>, EditableConfigListDispatchProps<IndividualAdminsData>, EditableConfigListOwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(IndividualAdmins);

export default ConnectedIndividualAdmins;