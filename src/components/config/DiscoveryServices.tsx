import * as React from "react";
import {
  GenericEditableConfigList,
  EditableConfigListStateProps,
  EditableConfigListDispatchProps,
  EditableConfigListOwnProps,
} from "./EditableConfigList";
import * as PropTypes from "prop-types";
import {
  DiscoveryServicesData,
  DiscoveryServiceData,
  LibraryData,
  LibraryRegistrationsData,
} from "../../interfaces";
import {
  useGetDiscoveryServicesQuery,
  useGetLibrariesQuery,
  useEditDiscoveryServiceMutation,
  useDeleteDiscoveryServiceMutation,
  useRegisterLibraryWithDiscoveryServiceMutation,
  useGetDiscoveryServiceLibraryRegistrationsQuery,
  rtkErrorToFetchError,
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

function DiscoveryServicesWithData(ownProps: EditableConfigListOwnProps) {
  const { csrfToken } = ownProps;
  const discoveryResult = useGetDiscoveryServicesQuery();
  const librariesResult = useGetLibrariesQuery();
  const registrationsResult = useGetDiscoveryServiceLibraryRegistrationsQuery();
  const [editDiscovery, editResult] = useEditDiscoveryServiceMutation();
  const [deleteDiscovery] = useDeleteDiscoveryServiceMutation();
  const [
    registerLibrary,
    registerResult,
  ] = useRegisterLibraryWithDiscoveryServiceMutation();
  const data: DiscoveryServicesData = {
    ...discoveryResult.data,
  } as DiscoveryServicesData;
  if (librariesResult.data?.libraries) {
    data.allLibraries = librariesResult.data.libraries;
  }
  if (registrationsResult.data?.library_registrations) {
    data.libraryRegistrations = registrationsResult.data.library_registrations;
  }
  const editFormError = editResult.isError
    ? rtkErrorToFetchError(editResult.error)
    : null;
  const registerFormError = registerResult.isError
    ? rtkErrorToFetchError(registerResult.error)
    : null;
  return (
    <DiscoveryServices
      {...ownProps}
      data={data}
      fetchError={
        discoveryResult.error
          ? rtkErrorToFetchError(discoveryResult.error)
          : null
      }
      formError={editFormError || registerFormError}
      isFetching={discoveryResult.isFetching || registerResult.isLoading}
      isFetchingLibraryRegistrations={registrationsResult.isFetching}
      responseBody={editResult.isSuccess ? (editResult.data as string) : null}
      fetchData={() => setTimeout(() => discoveryResult.refetch(), 0) as any}
      fetchLibraryRegistrations={() =>
        setTimeout(() => registrationsResult.refetch(), 0) as any
      }
      editItem={(data) => editDiscovery({ data, csrfToken }) as any}
      deleteItem={(identifier) =>
        deleteDiscovery({ identifier, csrfToken }) as any
      }
      registerLibrary={(data) => registerLibrary({ data, csrfToken }) as any}
    />
  );
}

export default DiscoveryServicesWithData;
