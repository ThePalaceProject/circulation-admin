import EditableConfigList, { EditableConfigListStateProps, EditableConfigListDispatchProps, EditableConfigListOwnProps } from "./EditableConfigList";
import { connect } from "react-redux";
import ActionCreator from "../actions";
import { CatalogServicesData, CatalogServiceData } from "../interfaces";
import ServiceEditForm from "./ServiceEditForm";

/** Right panel for catalog services on the system configuration page.
    Shows a list of current catalog services and allows creating a new
    service or editing or deleting an existing service. */
export class CatalogServices extends EditableConfigList<CatalogServicesData, CatalogServiceData> {
  EditForm = ServiceEditForm;
  listDataKey = "catalog_services";
  itemTypeName = "catalog service";
  urlBase = "/admin/web/config/catalogServices/";
  identifierKey = "id";
  labelKey = "protocol";

  label(item): string {
    for (const protocol of this.props.data.protocols) {
      if (protocol.name === item.protocol) {
        return `${item.name}: ${protocol.label}`;
      }
    }
    return item.protocol;
  }
}

function mapStateToProps(state, ownProps) {
  const data = Object.assign({}, state.editor.catalogServices && state.editor.catalogServices.data || {});
  if (state.editor.libraries && state.editor.libraries.data) {
    data.allLibraries = state.editor.libraries.data.libraries;
  }
  // fetchError = an error involving loading the list of catalog services; formError = an error upon submission
  // of the create/edit form.
  return {
    data: data,
    responseBody: state.editor.catalogServices && state.editor.catalogServices.successMessage,
    fetchError: state.editor.catalogServices.fetchError,
    formError: state.editor.catalogServices.formError,
    isFetching: state.editor.catalogServices.isFetching || state.editor.catalogServices.isEditing
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  let actions = new ActionCreator(null, ownProps.csrfToken);
  return {
    fetchData: () => dispatch(actions.fetchCatalogServices()),
    editItem: (data: FormData) => dispatch(actions.editCatalogService(data)),
    deleteItem: (identifier: string | number) => dispatch(actions.deleteCatalogService(identifier))
  };
}

const ConnectedCatalogServices = connect<EditableConfigListStateProps<CatalogServicesData>, EditableConfigListDispatchProps<CatalogServicesData>, EditableConfigListOwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(CatalogServices);

export default ConnectedCatalogServices;
