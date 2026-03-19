import * as React from "react";
import {
  GenericEditableConfigList,
  EditableConfigListStateProps,
  EditableConfigListDispatchProps,
  EditableConfigListOwnProps,
} from "./EditableConfigList";
import * as PropTypes from "prop-types";
import { LibrariesData, LibraryData, LanguagesData } from "../../interfaces";
import { useGetLanguagesQuery } from "../../features/referenceData/referenceDataSlice";
import {
  useGetLibrariesQuery,
  useEditLibraryMutation,
  useDeleteLibraryMutation,
  rtkErrorToFetchError,
} from "../../features/configServices/configServicesSlice";
import Admin from "../../models/Admin";
import LibraryEditForm from "./LibraryEditForm";

/** Right panel for library configuration on the system configuration page.
    Shows a list of current libraries and allows creating a new library or
    editing or deleting an existing library. */

export interface LibrariesStateProps
  extends EditableConfigListStateProps<LibrariesData> {
  additionalData?: LanguagesData;
}

export interface LibrariesDispatchProps
  extends EditableConfigListDispatchProps<LibrariesData> {
  fetchLanguages: () => void;
}

export interface LibrariesProps
  extends LibrariesStateProps,
    LibrariesDispatchProps,
    EditableConfigListOwnProps {}

export class Libraries extends GenericEditableConfigList<
  LibrariesData,
  LibraryData,
  LibrariesProps
> {
  EditForm = LibraryEditForm;
  listDataKey = "libraries";
  itemTypeName = "library";
  urlBase = "/admin/web/config/libraries/";
  identifierKey = "uuid";
  labelKey = "name";

  context: { admin: Admin };
  static contextTypes = {
    admin: PropTypes.object.isRequired,
  };

  UNSAFE_componentWillMount() {
    super.UNSAFE_componentWillMount();
    this.props.fetchLanguages();
  }

  label(item): string {
    return item[this.labelKey] || item.short_name || item.uuid;
  }

  canCreate() {
    return this.context.admin.isSystemAdmin();
  }

  canDelete() {
    return this.context.admin.isSystemAdmin();
  }
}

function LibrariesWithData(ownProps: EditableConfigListOwnProps) {
  const { csrfToken } = ownProps;
  const librariesResult = useGetLibrariesQuery();
  const languagesResult = useGetLanguagesQuery();
  const [editLibrary, editResult] = useEditLibraryMutation();
  const [deleteLibrary] = useDeleteLibraryMutation();
  return (
    <Libraries
      {...ownProps}
      data={librariesResult.data ?? null}
      fetchError={
        librariesResult.error
          ? rtkErrorToFetchError(librariesResult.error)
          : null
      }
      formError={
        editResult.isError ? rtkErrorToFetchError(editResult.error) : null
      }
      isFetching={librariesResult.isFetching}
      responseBody={editResult.isSuccess ? (editResult.data as string) : null}
      additionalData={languagesResult.data ?? null}
      fetchData={() => setTimeout(() => librariesResult.refetch(), 0) as any}
      editItem={(data) => editLibrary({ data, csrfToken }) as any}
      deleteItem={(identifier) =>
        deleteLibrary({ identifier, csrfToken }) as any
      }
      fetchLanguages={() => undefined}
    />
  );
}

export default LibrariesWithData;
