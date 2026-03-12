import * as React from "react";
import {
  GenericEditableConfigList,
  EditableConfigListStateProps,
  EditableConfigListDispatchProps,
  EditableConfigListOwnProps,
} from "./EditableConfigList";
import { connect } from "react-redux";
import * as PropTypes from "prop-types";
import {
  DiscoveryServicesData,
  DiscoveryServiceData,
  LibraryData,
  LibraryRegistrationsData,
} from "../../interfaces";
import {
  configServicesApi,
  getLastMutation,
  rtkErrorToFetchError,
  isResultFetching,
} from "../../features/configServices/configServicesSlice";
import ServiceWithRegistrationsEditForm from "./ServiceWithRegistrationsEditForm";

export interface DiscoveryServicesStateProps
  extends EditableConfigListStateProps<DiscoveryServicesData> {
  isFetchingLibraryRegistrations?: boolean;
}

export interface DiscoveryServicesDispatchProps
  extends EditableConfigListDispatchProps<DiscoveryServicesData> {
  registerLibrary: (data: FormData) => Promise<void>;
  fetchLibraryRegistrations?: () => Promise<LibraryRegistrationsData>;
}

export interface DiscoveryServicesProps
  extends DiscoveryServicesStateProps,
    DiscoveryServicesDispatchProps,
    EditableConfigListOwnProps {}

export class DiscoveryServiceEditForm extends ServiceWithRegistrationsEditForm<
  DiscoveryServicesData
> {}

/** Right panel for discovery services on the system configuration page.
    Shows a list of current discovery services and allows creating a new
    service or editing or deleting an existing service. */
export class DiscoveryServices extends GenericEditableConfigList<
  DiscoveryServicesData,
  DiscoveryServiceData,
  DiscoveryServicesProps
> {
  EditForm = DiscoveryServiceEditForm;
  listDataKey = "discovery_services";
  itemTypeName = "discovery service";
  urlBase = "/admin/web/config/discovery/";
  identifierKey = "id";
  labelKey = "name";

  static childContextTypes: React.ValidationMap<any> = {
    registerLibrary: PropTypes.func,
  };

  getChildContext() {
    return {
      registerLibrary: (library: LibraryData, registration_stage: string) => {
        if (this.itemToEdit()) {
          const data = new (window as any).FormData();
          data.append("library_short_name", library.short_name);
          data.append("registration_stage", registration_stage);
          data.append("integration_id", this.itemToEdit().id);
          this.props.registerLibrary(data).then(() => {
            if (this.props.fetchLibraryRegistrations) {
              this.props.fetchLibraryRegistrations();
            }
          });
        }
      },
    };
  }

  UNSAFE_componentWillMount() {
    super.UNSAFE_componentWillMount();
    if (this.props.fetchLibraryRegistrations) {
      this.props.fetchLibraryRegistrations();
    }
  }
}

function mapStateToProps(state, _ownProps) {
  const discoveryResult = configServicesApi.endpoints.getDiscoveryServices.select()(
    state
  );
  const librariesResult = configServicesApi.endpoints.getLibraries.select()(
    state
  );
  const registrationsResult = configServicesApi.endpoints.getDiscoveryServiceLibraryRegistrations.select()(
    state
  );
  const lastEdit = getLastMutation(state, "editDiscoveryService");
  const lastRegister = getLastMutation(
    state,
    "registerLibraryWithDiscoveryService"
  );
  const data: DiscoveryServicesData = {
    ...discoveryResult.data,
  } as DiscoveryServicesData;
  if (librariesResult.data?.libraries) {
    data.allLibraries = librariesResult.data.libraries;
  }
  if (registrationsResult.data?.library_registrations) {
    data.libraryRegistrations = registrationsResult.data.library_registrations;
  }
  // fetchError = an error involving loading the list of discovery services; formError = an error upon
  // submission of the create/edit form (including upon submitting a change to a library's registration).
  const editFormError =
    lastEdit?.["status"] === "rejected"
      ? rtkErrorToFetchError(lastEdit["error"])
      : null;
  const registerFormError =
    lastRegister?.["status"] === "rejected"
      ? rtkErrorToFetchError(lastRegister["error"])
      : null;
  return {
    data,
    responseBody:
      lastEdit?.["status"] === "fulfilled"
        ? (lastEdit["data"] as string)
        : null,
    fetchError: discoveryResult.error
      ? rtkErrorToFetchError(discoveryResult.error)
      : null,
    formError: editFormError || registerFormError,
    isFetching:
      isResultFetching(discoveryResult) ||
      lastRegister?.["status"] === "pending",
    isFetchingLibraryRegistrations: isResultFetching(registrationsResult),
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  const csrfToken: string = ownProps.csrfToken;
  return {
    fetchData: () =>
      dispatch(
        configServicesApi.endpoints.getDiscoveryServices.initiate(undefined, {
          forceRefetch: true,
        })
      ),
    editItem: (data: FormData) =>
      dispatch(
        configServicesApi.endpoints.editDiscoveryService.initiate({
          data,
          csrfToken,
        })
      ),
    deleteItem: (identifier: string | number) =>
      dispatch(
        configServicesApi.endpoints.deleteDiscoveryService.initiate({
          identifier,
          csrfToken,
        })
      ),
    registerLibrary: (data: FormData) =>
      dispatch(
        configServicesApi.endpoints.registerLibraryWithDiscoveryService.initiate(
          { data, csrfToken }
        )
      ),
    fetchLibraryRegistrations: () =>
      dispatch(
        configServicesApi.endpoints.getDiscoveryServiceLibraryRegistrations.initiate(
          undefined,
          { forceRefetch: true }
        )
      ),
  };
}

const ConnectedDiscoveryServices = connect<
  DiscoveryServicesStateProps,
  DiscoveryServicesDispatchProps,
  EditableConfigListOwnProps
>(
  mapStateToProps,
  mapDispatchToProps
)(DiscoveryServices);

export default ConnectedDiscoveryServices;
