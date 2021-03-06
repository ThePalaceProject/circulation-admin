import * as React from "react";
import EditableConfigList, {
  EditableConfigListStateProps,
  EditableConfigListDispatchProps,
  EditableConfigListOwnProps,
} from "./EditableConfigList";
import { connect } from "react-redux";
import ActionCreator from "../actions";
import { MetadataServicesData, MetadataServiceData } from "../interfaces";
import ServiceEditForm from "./ServiceEditForm";

/** Right panel for metadata services on the system configuration page.
    Shows a list of current metadata services and allows creating a new
    service or editing or deleting an existing service. */
export class MetadataServices extends EditableConfigList<
  MetadataServicesData,
  MetadataServiceData
> {
  EditForm = ServiceEditForm;
  listDataKey = "metadata_services";
  itemTypeName = "metadata service";
  urlBase = "/admin/web/config/metadata/";
  identifierKey = "id";
  labelKey = "protocol";
  links = this.renderLinks();

  renderLinks(): { [key: string]: JSX.Element } {
    const linkBase = "/admin/web/troubleshooting/self-tests/metadataServices";
    const linkElement = <a href={linkBase}>the troubleshooting page</a>;
    return {
      info: (
        <>
          Self-tests for the metadata services have been moved to {linkElement}.
        </>
      ),
      footer: (
        <>Problems with your metadata services? Please visit {linkElement}.</>
      ),
    };
  }
  label(item): string {
    const label = item.name ? `${item.name}: ${item.protocol}` : item.protocol;
    return label;
  }
}

function mapStateToProps(state, ownProps) {
  const data = Object.assign(
    {},
    (state.editor.metadataServices && state.editor.metadataServices.data) || {}
  );
  if (state.editor.libraries && state.editor.libraries.data) {
    data.allLibraries = state.editor.libraries.data.libraries;
  }
  // fetchError = an error involving loading the list of metadata services; formError = an error upon submission of the
  // create/edit form.
  return {
    data: data,
    responseBody:
      state.editor.metadataServices &&
      state.editor.metadataServices.successMessage,
    fetchError: state.editor.metadataServices.fetchError,
    formError: state.editor.metadataServices.formError,
    isFetching:
      state.editor.metadataServices.isFetching ||
      state.editor.metadataServices.isEditing,
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  const actions = new ActionCreator(null, ownProps.csrfToken);
  return {
    fetchData: () => dispatch(actions.fetchMetadataServices()),
    editItem: (data: FormData) => dispatch(actions.editMetadataService(data)),
    deleteItem: (identifier: string | number) =>
      dispatch(actions.deleteMetadataService(identifier)),
  };
}

const ConnectedMetadataServices = connect<
  EditableConfigListStateProps<MetadataServicesData>,
  EditableConfigListDispatchProps<MetadataServicesData>,
  EditableConfigListOwnProps
>(
  mapStateToProps,
  mapDispatchToProps
)(MetadataServices);

export default ConnectedMetadataServices;
