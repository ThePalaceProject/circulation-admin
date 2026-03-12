import * as React from "react";
import EditableConfigList, {
  EditableConfigListStateProps,
  EditableConfigListDispatchProps,
  EditableConfigListOwnProps,
} from "./EditableConfigList";
import { connect } from "react-redux";
import {
  PatronAuthServicesData,
  PatronAuthServiceData,
} from "../../interfaces";
import {
  configServicesApi,
  getLastMutation,
  rtkErrorToFetchError,
  isResultFetching,
} from "../../features/configServices/configServicesSlice";
import ServiceEditForm from "./ServiceEditForm";
import NeighborhoodAnalyticsForm from "../patrons/NeighborhoodAnalyticsForm";

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

function mapStateToProps(state, _ownProps) {
  const patronResult = configServicesApi.endpoints.getPatronAuthServices.select()(
    state
  );
  const librariesResult = configServicesApi.endpoints.getLibraries.select()(
    state
  );
  const lastEdit = getLastMutation(state, "editPatronAuthService");
  const data: PatronAuthServicesData = {
    ...patronResult.data,
  } as PatronAuthServicesData;
  if (librariesResult.data?.libraries) {
    data.allLibraries = librariesResult.data.libraries;
  }
  // fetchError = an error involving loading the list of patron auth services; formError = an error upon submission
  // of the create/edit form.
  return {
    data,
    responseBody:
      lastEdit?.["status"] === "fulfilled"
        ? (lastEdit["data"] as string)
        : null,
    fetchError: patronResult.error
      ? rtkErrorToFetchError(patronResult.error)
      : null,
    formError:
      lastEdit?.["status"] === "rejected"
        ? rtkErrorToFetchError(lastEdit["error"])
        : null,
    isFetching: isResultFetching(patronResult),
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  const csrfToken: string = ownProps.csrfToken;
  return {
    fetchData: () =>
      dispatch(
        configServicesApi.endpoints.getPatronAuthServices.initiate(undefined, {
          forceRefetch: true,
        })
      ),
    editItem: (data: FormData) =>
      dispatch(
        configServicesApi.endpoints.editPatronAuthService.initiate({
          data,
          csrfToken,
        })
      ),
    deleteItem: (identifier: string | number) =>
      dispatch(
        configServicesApi.endpoints.deletePatronAuthService.initiate({
          identifier,
          csrfToken,
        })
      ),
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
