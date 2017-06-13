import EditableConfigList from "./EditableConfigList";
import { connect } from "react-redux";
import ActionCreator from "../actions";
import { PatronAuthServicesData, PatronAuthServiceData } from "../interfaces";
import PatronAuthServiceEditForm from "./PatronAuthServiceEditForm";

export class PatronAuthServices extends EditableConfigList<PatronAuthServicesData, PatronAuthServiceData> {
  EditForm = PatronAuthServiceEditForm;
  listDataKey = "patron_auth_services";
  itemTypeName = "patron authentication service";
  urlBase = "/admin/web/config/patronAuth/";
  identifierKey = "id";
  labelKey = "protocol";

  label(item): string {
    for (const protocol of this.props.data.protocols) {
      if (protocol.name === item.protocol) {
        return protocol.label;
      }
    }
    return item.protocol;
  }
}

function mapStateToProps(state, ownProps) {
  const data = Object.assign({}, state.editor.patronAuthServices && state.editor.patronAuthServices.data || {});
  if (state.editor.libraries && state.editor.libraries.data) {
    data.allLibraries = state.editor.libraries.data.libraries;
  }
  return {
    data: data,
    fetchError: state.editor.patronAuthServices.fetchError,
    isFetching: state.editor.patronAuthServices.isFetching || state.editor.patronAuthServices.isEditing
  };
}

function mapDispatchToProps(dispatch) {
  let actions = new ActionCreator();
  return {
    fetchData: () => dispatch(actions.fetchPatronAuthServices()),
    editItem: (data: FormData) => dispatch(actions.editPatronAuthService(data))
  };
}

const ConnectedPatronAuthServices = connect<any, any, any>(
  mapStateToProps,
  mapDispatchToProps
)(PatronAuthServices);

export default ConnectedPatronAuthServices;