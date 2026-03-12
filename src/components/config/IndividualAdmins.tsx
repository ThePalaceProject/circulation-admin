import * as PropTypes from "prop-types";
import EditableConfigList, {
  EditableConfigListStateProps,
  EditableConfigListDispatchProps,
  EditableConfigListOwnProps,
} from "./EditableConfigList";
import { connect } from "react-redux";
import { IndividualAdminsData, IndividualAdminData } from "../../interfaces";
import {
  configServicesApi,
  getLastMutation,
  rtkErrorToFetchError,
  isResultFetching,
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

function mapStateToProps(state, _ownProps) {
  const adminsResult = configServicesApi.endpoints.getIndividualAdmins.select()(
    state
  );
  const librariesResult = configServicesApi.endpoints.getLibraries.select()(
    state
  );
  const lastEdit = getLastMutation(state, "editIndividualAdmin");
  const data: IndividualAdminsData = {
    ...adminsResult.data,
  } as IndividualAdminsData;
  if (librariesResult.data?.libraries) {
    data.allLibraries = librariesResult.data.libraries;
  }
  // fetchError = an error involving loading the list of individual admins; formError = an error upon submission of the
  // create/edit form.
  return {
    data,
    responseBody:
      lastEdit?.["status"] === "fulfilled"
        ? (lastEdit["data"] as string)
        : null,
    fetchError: adminsResult.error
      ? rtkErrorToFetchError(adminsResult.error)
      : null,
    formError:
      lastEdit?.["status"] === "rejected"
        ? rtkErrorToFetchError(lastEdit["error"])
        : null,
    isFetching: isResultFetching(adminsResult),
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  const csrfToken: string = ownProps.csrfToken;
  return {
    fetchData: () =>
      dispatch(
        configServicesApi.endpoints.getIndividualAdmins.initiate(undefined, {
          forceRefetch: true,
        })
      ),
    editItem: (data: FormData) =>
      dispatch(
        configServicesApi.endpoints.editIndividualAdmin.initiate({
          data,
          csrfToken,
        })
      ),
    deleteItem: (identifier: string | number) =>
      dispatch(
        configServicesApi.endpoints.deleteIndividualAdmin.initiate({
          identifier,
          csrfToken,
        })
      ),
  };
}

const ConnectedIndividualAdmins = connect<
  EditableConfigListStateProps<IndividualAdminsData>,
  EditableConfigListDispatchProps<IndividualAdminsData>,
  EditableConfigListOwnProps
>(
  mapStateToProps,
  mapDispatchToProps
)(IndividualAdmins);

export default ConnectedIndividualAdmins;
