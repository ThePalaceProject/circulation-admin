import * as React from "react";
import {
  GenericEditableConfigList,
  EditableConfigListStateProps,
  EditableConfigListDispatchProps,
  EditableConfigListOwnProps,
} from "./EditableConfigList";
import { connect } from "react-redux";
import * as PropTypes from "prop-types";
import ActionCreator from "../actions";
import {
  DiscoveryServicesData,
  DiscoveryServiceData,
  LibraryData,
  LibraryDataWithStatus,
  LibraryRegistrationsData,
} from "../interfaces";
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

  private registeredLibraries(
    item: DiscoveryServiceData
  ): LibraryDataWithStatus[] | undefined {
    const registrations = this.props.data?.libraryRegistrations;
    if (!registrations) return undefined;
    const serviceReg = registrations.find((r) => r.id === item.id);
    return (serviceReg?.libraries ?? []).filter((l) => l.status === "success");
  }

  protected getAssociatedItems(
    item: DiscoveryServiceData
  ): Array<any> | undefined {
    return this.registeredLibraries(item);
  }

  protected formatAssociatedCount(count: number): string {
    return count === 0
      ? "no registered libraries"
      : count === 1
      ? "1 registered library"
      : `${count} registered libraries`;
  }

  protected getAssociatedEntries(
    item: DiscoveryServiceData
  ): Array<{ label: string; suffix?: string; href?: string }> {
    const registered = this.registeredLibraries(item) ?? [];
    const allLibraries = this.props.data?.allLibraries ?? [];
    return registered.map((lib) => {
      const meta = allLibraries.find((l) => l.short_name === lib.short_name);
      const uuid = meta?.uuid ?? lib.uuid;
      return {
        label: meta?.name ?? lib.name ?? lib.short_name,
        suffix: lib.stage ? ` - registered - ${lib.stage}` : " - registered",
        href: uuid ? `/admin/web/config/libraries/edit/${uuid}` : undefined,
      };
    });
  }

  UNSAFE_componentWillMount() {
    super.UNSAFE_componentWillMount();
    if (this.props.fetchLibraryRegistrations) {
      this.props.fetchLibraryRegistrations();
    }
  }
}

function mapStateToProps(state, ownProps) {
  const data = Object.assign(
    {},
    (state.editor.discoveryServices && state.editor.discoveryServices.data) ||
      {}
  );
  if (state.editor.libraries && state.editor.libraries.data) {
    data.allLibraries = state.editor.libraries.data.libraries;
  }
  if (
    state.editor.discoveryServiceLibraryRegistrations &&
    state.editor.discoveryServiceLibraryRegistrations.data
  ) {
    data.libraryRegistrations =
      state.editor.discoveryServiceLibraryRegistrations.data.library_registrations;
  }
  // fetchError = an error involving loading the list of discovery services; formError = an error upon
  // submission of the create/edit form (including upon submitting a change to a library's registration).
  return {
    data: data,
    responseBody:
      state.editor.discoveryServices &&
      state.editor.discoveryServices.successMessage,
    fetchError: state.editor.discoveryServices.fetchError,
    formError:
      state.editor.discoveryServices.formError ||
      (state.editor.registerLibraryWithDiscoveryService &&
        state.editor.registerLibraryWithDiscoveryService.fetchError),
    isFetching:
      state.editor.discoveryServices.isFetching ||
      state.editor.discoveryServices.isEditing ||
      (state.editor.registerLibraryWithDiscoveryService &&
        state.editor.registerLibraryWithDiscoveryService.isFetching),
    isFetchingLibraryRegistrations:
      state.editor.discoveryServiceLibraryRegistrations &&
      state.editor.discoveryServiceLibraryRegistrations.isFetching,
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  const actions = new ActionCreator(null, ownProps.csrfToken);
  return {
    fetchData: () => dispatch(actions.fetchDiscoveryServices()),
    editItem: (data: FormData) => dispatch(actions.editDiscoveryService(data)),
    deleteItem: (identifier: string | number) =>
      dispatch(actions.deleteDiscoveryService(identifier)),
    registerLibrary: (data: FormData) =>
      dispatch(actions.registerLibraryWithDiscoveryService(data)),
    fetchLibraryRegistrations: () =>
      dispatch(actions.fetchDiscoveryServiceLibraryRegistrations()),
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
