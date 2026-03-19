import * as React from "react";
import EditableConfigList, {
  EditableConfigListOwnProps,
} from "./EditableConfigList";
import { MetadataServicesData, MetadataServiceData } from "../../interfaces";
import {
  useGetMetadataServicesQuery,
  useGetLibrariesQuery,
  useEditMetadataServiceMutation,
  useDeleteMetadataServiceMutation,
  rtkErrorToFetchError,
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

function MetadataServicesWithData(ownProps: EditableConfigListOwnProps) {
  const { csrfToken } = ownProps;
  const metaResult = useGetMetadataServicesQuery();
  const librariesResult = useGetLibrariesQuery();
  const [editMetadata, editResult] = useEditMetadataServiceMutation();
  const [deleteMetadata] = useDeleteMetadataServiceMutation();
  const data: MetadataServicesData = {
    ...metaResult.data,
  } as MetadataServicesData;
  if (librariesResult.data?.libraries) {
    data.allLibraries = librariesResult.data.libraries;
  }
  return (
    <MetadataServices
      {...ownProps}
      data={data}
      fetchError={
        metaResult.error ? rtkErrorToFetchError(metaResult.error) : null
      }
      formError={
        editResult.isError ? rtkErrorToFetchError(editResult.error) : null
      }
      isFetching={metaResult.isFetching}
      responseBody={editResult.isSuccess ? (editResult.data as string) : null}
      fetchData={() => setTimeout(() => metaResult.refetch(), 0) as any}
      editItem={(data) => editMetadata({ data, csrfToken }) as any}
      deleteItem={(identifier) =>
        deleteMetadata({ identifier, csrfToken }) as any
      }
    />
  );
}

export default MetadataServicesWithData;
