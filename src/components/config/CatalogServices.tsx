import EditableConfigList, {
  EditableConfigListStateProps,
  EditableConfigListDispatchProps,
  EditableConfigListOwnProps,
} from "./EditableConfigList";
import { connect } from "react-redux";
import { CatalogServicesData, CatalogServiceData } from "../../interfaces";
import {
  configServicesApi,
  getLastMutation,
  rtkErrorToFetchError,
  isResultFetching,
} from "../../features/configServices/configServicesSlice";
import ServiceEditForm from "./ServiceEditForm";

/** Right panel for catalog services on the system configuration page.
    Shows a list of current catalog services and allows creating a new
    service or editing or deleting an existing service. */
export class CatalogServices extends EditableConfigList<
  CatalogServicesData,
  CatalogServiceData
> {
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

function mapStateToProps(state, _ownProps) {
  const catalogResult = configServicesApi.endpoints.getCatalogServices.select()(
    state
  );
  const librariesResult = configServicesApi.endpoints.getLibraries.select()(
    state
  );
  const lastEdit = getLastMutation(state, "editCatalogService");
  const data: CatalogServicesData = {
    ...catalogResult.data,
  } as CatalogServicesData;
  if (librariesResult.data?.libraries) {
    data.allLibraries = librariesResult.data.libraries;
  }
  // fetchError = an error involving loading the list of catalog services; formError = an error upon submission
  // of the create/edit form.
  return {
    data,
    responseBody:
      lastEdit?.["status"] === "fulfilled"
        ? (lastEdit["data"] as string)
        : null,
    fetchError: catalogResult.error
      ? rtkErrorToFetchError(catalogResult.error)
      : null,
    formError:
      lastEdit?.["status"] === "rejected"
        ? rtkErrorToFetchError(lastEdit["error"])
        : null,
    isFetching: isResultFetching(catalogResult),
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  const csrfToken: string = ownProps.csrfToken;
  return {
    fetchData: () =>
      dispatch(
        configServicesApi.endpoints.getCatalogServices.initiate(undefined, {
          forceRefetch: true,
        })
      ),
    editItem: (data: FormData) =>
      dispatch(
        configServicesApi.endpoints.editCatalogService.initiate({
          data,
          csrfToken,
        })
      ),
    deleteItem: (identifier: string | number) =>
      dispatch(
        configServicesApi.endpoints.deleteCatalogService.initiate({
          identifier,
          csrfToken,
        })
      ),
  };
}

const ConnectedCatalogServices = connect<
  EditableConfigListStateProps<CatalogServicesData>,
  EditableConfigListDispatchProps<CatalogServicesData>,
  EditableConfigListOwnProps
>(
  mapStateToProps,
  mapDispatchToProps
)(CatalogServices);

export default ConnectedCatalogServices;
