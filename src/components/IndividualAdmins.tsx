import EditableConfigList from "./EditableConfigList";
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
    fetchError: state.editor.individualAdmins.fetchError,
    isFetching: state.editor.individualAdmins.isFetching || state.editor.individualAdmins.isEditing
  };
}

function mapDispatchToProps(dispatch) {
  let actions = new ActionCreator();
  return {
    fetchData: () => dispatch(actions.fetchIndividualAdmins()),
    editItem: (data: FormData) => dispatch(actions.editIndividualAdmin(data))
  };
}

const ConnectedIndividualAdmins = connect<any, any, any>(
  mapStateToProps,
  mapDispatchToProps
)(IndividualAdmins);

export default ConnectedIndividualAdmins;