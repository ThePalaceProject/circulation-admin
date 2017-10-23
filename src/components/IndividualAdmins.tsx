import EditableConfigList, { EditableConfigListStateProps, EditableConfigListDispatchProps, EditableConfigListOwnProps } from "./EditableConfigList";
import { connect } from "react-redux";
import ActionCreator from "../actions";
import { IndividualAdminsData, IndividualAdminData } from "../interfaces";
import IndividualAdminEditForm from "./IndividualAdminEditForm";

export class IndividualAdmins extends EditableConfigList<IndividualAdminsData, IndividualAdminData> {
  EditForm = IndividualAdminEditForm;
  listDataKey = "individualAdmins";
  itemTypeName = "individual admin";
  urlBase = "/admin/web/config/individualAdmins/";
  identifierKey = "email";
  labelKey = "email";
}

function mapStateToProps(state, ownProps) {
  return {
    data: state.editor.individualAdmins && state.editor.individualAdmins.data,
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