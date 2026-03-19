import * as React from "react";
import EditableConfigList, {
  EditableConfigListOwnProps,
} from "./EditableConfigList";
import { CatalogServicesData, CatalogServiceData } from "../../interfaces";
import {
  useGetCatalogServicesQuery,
  useGetLibrariesQuery,
  useEditCatalogServiceMutation,
  useDeleteCatalogServiceMutation,
  rtkErrorToFetchError,
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

function CatalogServicesWithData(ownProps: EditableConfigListOwnProps) {
  const { csrfToken } = ownProps;
  const catalogResult = useGetCatalogServicesQuery();
  const librariesResult = useGetLibrariesQuery();
  const [editCatalog, editResult] = useEditCatalogServiceMutation();
  const [deleteCatalog] = useDeleteCatalogServiceMutation();
  const data: CatalogServicesData = {
    ...catalogResult.data,
  } as CatalogServicesData;
  if (librariesResult.data?.libraries) {
    data.allLibraries = librariesResult.data.libraries;
  }
  return (
    <CatalogServices
      {...ownProps}
      data={data}
      fetchError={
        catalogResult.error ? rtkErrorToFetchError(catalogResult.error) : null
      }
      formError={
        editResult.isError ? rtkErrorToFetchError(editResult.error) : null
      }
      isFetching={catalogResult.isFetching}
      responseBody={editResult.isSuccess ? (editResult.data as string) : null}
      fetchData={() => setTimeout(() => catalogResult.refetch(), 0) as any}
      editItem={(data) => editCatalog({ data, csrfToken }) as any}
      deleteItem={(identifier) =>
        deleteCatalog({ identifier, csrfToken }) as any
      }
    />
  );
}

export default CatalogServicesWithData;
