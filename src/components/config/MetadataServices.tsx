import * as React from "react";
import EditableConfigList, {
  EditableConfigListStateProps,
  EditableConfigListDispatchProps,
  EditableConfigListOwnProps,
} from "./EditableConfigList";
import { connect } from "react-redux";
import { MetadataServicesData, MetadataServiceData } from "../../interfaces";
import {
  configServicesApi,
  getLastMutation,
  rtkErrorToFetchError,
  isResultFetching,
} from "../../features/configServices/configServicesSlice";
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

function mapStateToProps(state, _ownProps) {
  const metaResult = configServicesApi.endpoints.getMetadataServices.select()(
    state
  );
  const librariesResult = configServicesApi.endpoints.getLibraries.select()(
    state
  );
  const lastEdit = getLastMutation(state, "editMetadataService");
  const data: MetadataServicesData = {
    ...metaResult.data,
  } as MetadataServicesData;
  if (librariesResult.data?.libraries) {
    data.allLibraries = librariesResult.data.libraries;
  }
  // fetchError = an error involving loading the list of metadata services; formError = an error upon submission of the
  // create/edit form.
  return {
    data,
    responseBody:
      lastEdit?.["status"] === "fulfilled"
        ? (lastEdit["data"] as string)
        : null,
    fetchError: metaResult.error
      ? rtkErrorToFetchError(metaResult.error)
      : null,
    formError:
      lastEdit?.["status"] === "rejected"
        ? rtkErrorToFetchError(lastEdit["error"])
        : null,
    isFetching: isResultFetching(metaResult),
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  const csrfToken: string = ownProps.csrfToken;
  return {
    fetchData: () =>
      dispatch(
        configServicesApi.endpoints.getMetadataServices.initiate(undefined, {
          forceRefetch: true,
        })
      ),
    editItem: (data: FormData) =>
      dispatch(
        configServicesApi.endpoints.editMetadataService.initiate({
          data,
          csrfToken,
        })
      ),
    deleteItem: (identifier: string | number) =>
      dispatch(
        configServicesApi.endpoints.deleteMetadataService.initiate({
          identifier,
          csrfToken,
        })
      ),
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
