import {
  GenericEditableConfigList,
  EditableConfigListStateProps,
  EditableConfigListDispatchProps,
  EditableConfigListOwnProps,
} from "./EditableConfigList";
import { connect } from "react-redux";
import * as PropTypes from "prop-types";
import { LibrariesData, LibraryData, LanguagesData } from "../../interfaces";
import { referenceDataApi } from "../../features/referenceData/referenceDataSlice";
import {
  configServicesApi,
  getLastMutation,
  rtkErrorToFetchError,
  isResultFetching,
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

function mapStateToProps(state, _ownProps) {
  const languagesResult = referenceDataApi.endpoints.getLanguages.select()(
    state
  );
  const librariesResult = configServicesApi.endpoints.getLibraries.select()(
    state
  );
  const lastEdit = getLastMutation(state, "editLibrary");
  // fetchError = an error involving loading the list of libraries; formError = an error upon submission of the
  // create/edit form.
  return {
    data: librariesResult.data ?? null,
    responseBody:
      lastEdit?.["status"] === "fulfilled"
        ? (lastEdit["data"] as string)
        : null,
    fetchError: librariesResult.error
      ? rtkErrorToFetchError(librariesResult.error)
      : null,
    formError:
      lastEdit?.["status"] === "rejected"
        ? rtkErrorToFetchError(lastEdit["error"])
        : null,
    isFetching: isResultFetching(librariesResult),
    additionalData: languagesResult.data ?? null,
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  const csrfToken: string = ownProps.csrfToken;
  return {
    fetchData: () =>
      dispatch(
        configServicesApi.endpoints.getLibraries.initiate(undefined, {
          forceRefetch: true,
        })
      ),
    editItem: (data: FormData) =>
      dispatch(
        configServicesApi.endpoints.editLibrary.initiate({ data, csrfToken })
      ),
    deleteItem: (identifier: string | number) =>
      dispatch(
        configServicesApi.endpoints.deleteLibrary.initiate({
          identifier,
          csrfToken,
        })
      ),
    fetchLanguages: () =>
      dispatch(referenceDataApi.endpoints.getLanguages.initiate(undefined)),
  };
}

const ConnectedLibraries = connect<
  EditableConfigListStateProps<LibrariesData>,
  EditableConfigListDispatchProps<LibrariesData>,
  EditableConfigListOwnProps
>(
  mapStateToProps,
  mapDispatchToProps
)(Libraries);

export default ConnectedLibraries;
