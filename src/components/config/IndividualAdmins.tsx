import * as React from "react";
import * as PropTypes from "prop-types";
import EditableConfigList, {
  EditableConfigListOwnProps,
} from "./EditableConfigList";
import { IndividualAdminsData, IndividualAdminData } from "../../interfaces";
import {
  useGetIndividualAdminsQuery,
  useGetLibrariesQuery,
  useEditIndividualAdminMutation,
  useDeleteIndividualAdminMutation,
  rtkErrorToFetchError,
} from "../../features/configServices/configServicesSlice";
import Admin from "../../models/Admin";
import IndividualAdminEditForm from "./IndividualAdminEditForm";

/** Right panel for individual admin configuration on the system configuration page.
    Shows a list of current individual admins and allows create a new admin or
    editing or deleting an existing admin. */
export class IndividualAdmins extends EditableConfigList<
  IndividualAdminsData,
  IndividualAdminData
> {
  EditForm = IndividualAdminEditForm;
  listDataKey = "individualAdmins";
  itemTypeName = "individual admin";
  urlBase = "/admin/web/config/individualAdmins/";
  identifierKey = "email";
  labelKey = "email";

  context: { admin: Admin };
  static contextTypes = {
    admin: PropTypes.object.isRequired,
  };

  canCreate() {
    return (
      this.context.admin && this.context.admin.isLibraryManagerOfSomeLibrary()
    );
  }

  canDelete() {
    return this.context.admin && this.context.admin.isSystemAdmin();
  }

  canEdit() {
    return (
      this.context.admin && this.context.admin.isLibraryManagerOfSomeLibrary()
    );
  }

  getHeaders() {
    const h2 = this.props.settingUp
      ? "Welcome!"
      : "Individual admin configuration";
    const h3 = this.props.settingUp
      ? "Set up your system admin account"
      : "Create a new individual admin";
    return { h2, h3 };
  }

  getClassName(): string {
    const className = this.props.settingUp ? "set-up" : "";
    return className;
  }

  save(data: FormData) {
    this.editItem(data).then(() => {
      // If we're setting up an admin for the first time, refresh the page
      // to go to login.
      if (this.props.settingUp) {
        window.location.reload();
        return;
      }
    });
  }
}

function IndividualAdminsWithData(ownProps: EditableConfigListOwnProps) {
  const { csrfToken } = ownProps;
  const adminsResult = useGetIndividualAdminsQuery();
  const librariesResult = useGetLibrariesQuery();
  const [editAdmin, editResult] = useEditIndividualAdminMutation();
  const [deleteAdmin] = useDeleteIndividualAdminMutation();
  const data: IndividualAdminsData = {
    ...adminsResult.data,
  } as IndividualAdminsData;
  if (librariesResult.data?.libraries) {
    data.allLibraries = librariesResult.data.libraries;
  }
  return (
    <IndividualAdmins
      {...ownProps}
      data={data}
      fetchError={
        adminsResult.error ? rtkErrorToFetchError(adminsResult.error) : null
      }
      formError={
        editResult.isError ? rtkErrorToFetchError(editResult.error) : null
      }
      isFetching={adminsResult.isFetching}
      responseBody={editResult.isSuccess ? (editResult.data as string) : null}
      fetchData={() => setTimeout(() => adminsResult.refetch(), 0) as any}
      editItem={(data) => editAdmin({ data, csrfToken }) as any}
      deleteItem={(identifier) => deleteAdmin({ identifier, csrfToken }) as any}
    />
  );
}

export default IndividualAdminsWithData;
