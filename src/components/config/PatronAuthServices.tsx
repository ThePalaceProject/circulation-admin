import * as React from "react";
import EditableConfigList, {
  EditableConfigListOwnProps,
} from "./EditableConfigList";
import {
  PatronAuthServicesData,
  PatronAuthServiceData,
} from "../../interfaces";
import {
  useGetPatronAuthServicesQuery,
  useGetLibrariesQuery,
  useEditPatronAuthServiceMutation,
  useDeletePatronAuthServiceMutation,
  rtkErrorToFetchError,
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

function PatronAuthServicesWithData(ownProps: EditableConfigListOwnProps) {
  const { csrfToken } = ownProps;
  const patronResult = useGetPatronAuthServicesQuery();
  const librariesResult = useGetLibrariesQuery();
  const [editPatron, editResult] = useEditPatronAuthServiceMutation();
  const [deletePatron] = useDeletePatronAuthServiceMutation();
  const data: PatronAuthServicesData = {
    ...patronResult.data,
  } as PatronAuthServicesData;
  if (librariesResult.data?.libraries) {
    data.allLibraries = librariesResult.data.libraries;
  }
  return (
    <PatronAuthServices
      {...ownProps}
      data={data}
      fetchError={
        patronResult.error ? rtkErrorToFetchError(patronResult.error) : null
      }
      formError={
        editResult.isError ? rtkErrorToFetchError(editResult.error) : null
      }
      isFetching={patronResult.isFetching}
      responseBody={editResult.isSuccess ? (editResult.data as string) : null}
      fetchData={() => setTimeout(() => patronResult.refetch(), 0) as any}
      editItem={(data) => editPatron({ data, csrfToken }) as any}
      deleteItem={(identifier) =>
        deletePatron({ identifier, csrfToken }) as any
      }
    />
  );
}

export default PatronAuthServicesWithData;
