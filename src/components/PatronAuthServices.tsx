import * as React from "react";
import EditableConfigList, {
  EditableConfigListStateProps,
  EditableConfigListDispatchProps,
  EditableConfigListOwnProps,
} from "./EditableConfigList";
import { connect } from "react-redux";
import ActionCreator from "../actions";
import { PatronAuthServicesData, PatronAuthServiceData } from "../interfaces";
import ServiceEditForm from "./ServiceEditForm";
import NeighborhoodAnalyticsForm from "./NeighborhoodAnalyticsForm";

/** Right panel for patron authentication services on the system
    configuration page. Shows a list of current patron authentication
    services and allows creating a new service or editing or deleting
    an existing service. */
export class PatronAuthServices extends EditableConfigList<
  PatronAuthServicesData,
  PatronAuthServiceData
> {
  EditForm = ServiceEditForm;
  ExtraFormSection = NeighborhoodAnalyticsForm;
  extraFormKey = "neighborhood_mode";
  listDataKey = "patron_auth_services";
  itemTypeName = "patron authentication service";
  urlBase = "/admin/web/config/patronAuth/";
  identifierKey = "id";
  labelKey = "protocol";
  links = this.renderLinks();

  label(item): string {
    for (const protocol of this.props.data.protocols) {
      if (protocol.name === item.protocol) {
        return `${item.name}: ${protocol.label}`;
      }
    }
    return item.protocol;
  }

  renderLinks(): { [key: string]: JSX.Element } {
    const linkBase = "/admin/web/troubleshooting/self-tests/patronAuthServices";
    const linkElement = <a href={linkBase}>the troubleshooting page</a>;
    return {
      info: (
        <>
          Self-tests for the patron authentication services have been moved to{" "}
          {linkElement}.
        </>
      ),
      footer: (
        <>
          Problems with your patron authentication services? Please visit{" "}
          {linkElement}.
        </>
      ),
    };
  }
}

function mapStateToProps(state, ownProps) {
  const data = Object.assign(
    {},
    (state.editor.patronAuthServices && state.editor.patronAuthServices.data) ||
      {}
  );
  if (state.editor.libraries && state.editor.libraries.data) {
    data.allLibraries = state.editor.libraries.data.libraries;
  }
  // fetchError = an error involving loading the list of patron auth services; formError = an error upon submission
  // of the create/edit form.
  return {
    data: data,
    responseBody:
      state.editor.patronAuthServices &&
      state.editor.patronAuthServices.successMessage,
    fetchError: state.editor.patronAuthServices.fetchError,
    formError: state.editor.patronAuthServices.formError,
    isFetching:
      state.editor.patronAuthServices.isFetching ||
      state.editor.patronAuthServices.isEditing,
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  const actions = new ActionCreator(null, ownProps.csrfToken);
  return {
    fetchData: () => dispatch(actions.fetchPatronAuthServices()),
    editItem: (data: FormData) => dispatch(actions.editPatronAuthService(data)),
    deleteItem: (identifier: string | number) =>
      dispatch(actions.deletePatronAuthService(identifier)),
  };
}

const ConnectedPatronAuthServices = connect<
  EditableConfigListStateProps<PatronAuthServicesData>,
  EditableConfigListDispatchProps<PatronAuthServicesData>,
  EditableConfigListOwnProps
>(
  mapStateToProps,
  mapDispatchToProps
)(PatronAuthServices);

export default ConnectedPatronAuthServices;
