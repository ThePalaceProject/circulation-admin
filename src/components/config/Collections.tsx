import * as React from "react";
import {
  GenericEditableConfigList,
  EditableConfigListStateProps,
  EditableConfigListDispatchProps,
  EditableConfigListOwnProps,
} from "./EditableConfigList";
import { connect } from "react-redux";
import * as PropTypes from "prop-types";
import {
  CollectionsData,
  CollectionData,
  LibraryData,
  LibraryWithSettingsData,
  LibraryRegistrationsData,
} from "../../interfaces";
import {
  configServicesApi,
  getLastMutation,
  rtkErrorToFetchError,
  isResultFetching,
} from "../../features/configServices/configServicesSlice";
import CollectionImportButton from "../shared/CollectionImportButton";
import ServiceWithRegistrationsEditForm from "./ServiceWithRegistrationsEditForm";
import TrashIcon from "../icons/TrashIcon";

export interface CollectionsStateProps
  extends EditableConfigListStateProps<CollectionsData> {
  isFetchingLibraryRegistrations?: boolean;
}

export interface CollectionsDispatchProps
  extends EditableConfigListDispatchProps<CollectionsData> {
  registerLibrary: (data: FormData) => Promise<void>;
  fetchLibraryRegistrations?: () => Promise<LibraryRegistrationsData>;
  importCollection: (
    collectionId: string | number,
    force: boolean
  ) => Promise<void>;
}

export interface CollectionsProps
  extends CollectionsStateProps,
    CollectionsDispatchProps,
    EditableConfigListOwnProps {}

export class CollectionEditForm extends ServiceWithRegistrationsEditForm<
  CollectionsData
> {
  context: ServiceWithRegistrationsEditForm<CollectionsData>["context"] & {
    importCollection: (
      collectionId: string | number,
      force: boolean
    ) => Promise<void>;
  };

  static contextTypes = {
    ...ServiceWithRegistrationsEditForm.contextTypes,
    importCollection: PropTypes.func,
  };

  /**
   * Override to display a confirmation message before removing a library
   * association. We display the confirmation and return `true` if the
   * action is confirmed or `false` otherwise.
   * @param library The library to remove.
   */
  isLibraryRemovalPermitted(library: LibraryWithSettingsData): boolean {
    const libraryData = this.getLibrary(library.short_name);
    const libraryName = libraryData ? libraryData.name : library.short_name;
    const confirmationMessage =
      `Disassociating library "${libraryName}" from this collection will ` +
      "remove all loans and holds for its patrons. Do you wish to continue?";
    return window.confirm(confirmationMessage);
  }

  renderAdditionalContent(): React.ReactNode[] {
    if (!this.props.item?.id) {
      return [];
    }
    return [
      <CollectionImportButton
        key="import"
        collection={this.props.item as CollectionData}
        protocols={this.props.data?.protocols || []}
        importCollection={this.context.importCollection}
        disabled={this.props.disabled}
      />,
    ];
  }
}

/**
 * Right panel for collections on the system configuration page.
 * Shows a list of current collections and allows creating a new
 * collection or editing or deleting an existing collection.
 * Also allows registering libraries with the collection when
 * the collection supports it.
 * ```
 * <Collections />
 * ```
 */
export class Collections extends GenericEditableConfigList<
  CollectionsData,
  CollectionData,
  CollectionsProps
> {
  EditForm = CollectionEditForm;
  listDataKey = "collections";
  itemTypeName = "collection";
  urlBase = "/admin/web/config/collections/";
  identifierKey = "id";
  labelKey = "name";
  links = this.renderLinks();

  static childContextTypes: React.ValidationMap<any> = {
    registerLibrary: PropTypes.func,
    importCollection: PropTypes.func,
  };

  getChildContext() {
    return {
      registerLibrary: (library: LibraryData) => {
        if (this.itemToEdit()) {
          const data = new (window as any).FormData();
          data.append("library_short_name", library.short_name);
          data.append("collection_id", this.itemToEdit().id);
          this.props.registerLibrary(data).then(() => {
            if (this.props.fetchLibraryRegistrations) {
              this.props.fetchLibraryRegistrations();
            }
          });
        }
      },
      importCollection: this.props.importCollection,
    };
  }

  UNSAFE_componentWillMount() {
    super.UNSAFE_componentWillMount();
    if (this.props.fetchLibraryRegistrations) {
      this.props.fetchLibraryRegistrations();
    }
  }

  renderLinks(): { [key: string]: JSX.Element } {
    const linkBase = "/admin/web/troubleshooting/self-tests/collections";
    const linkElement = <a href={linkBase}>the troubleshooting page</a>;
    return {
      info: (
        <>Self-tests for the collections have been moved to {linkElement}</>
      ),
      footer: <>Problems with your collections? Please visit {linkElement}.</>,
    };
  }

  renderLi(item, index): JSX.Element {
    if (item.marked_for_deletion) {
      return (
        <li className="deleted-collection" key={index}>
          <TrashIcon />
          <h4>{this.label(item)}</h4>
          <p>
            This collection cannot be edited and is currently being deleted. The
            deletion process is gradual and this collection will be removed once
            it is complete.
          </p>
        </li>
      );
    }
    return super.renderLi(item, index);
  }

  async delete(item: CollectionData): Promise<void> {
    const deleteInfo =
      "This action cannot be undone. Deletion will not happen " +
      "immediately but gradually. Until the collection is completely deleted, " +
      "it will remain in the list and will be uneditable.";
    if (
      window.confirm(`Set "${this.label(item)}" for deletion? ${deleteInfo}`)
    ) {
      await this.props.deleteItem(item[this.identifierKey]);
      this.props.fetchData();
    }
  }
}

function mapStateToProps(state, _ownProps) {
  const collectionsResult = configServicesApi.endpoints.getCollections.select()(
    state
  );
  const librariesResult = configServicesApi.endpoints.getLibraries.select()(
    state
  );
  const lastEdit = getLastMutation(state, "editCollection");
  const data: CollectionsData = {
    ...collectionsResult.data,
  } as CollectionsData;
  if (librariesResult.data?.libraries) {
    data.allLibraries = librariesResult.data.libraries;
  }
  // fetchError = an error involving loading the list of collections; formError = an error upon
  // submission of the create/edit form.
  return {
    data,
    responseBody:
      lastEdit?.["status"] === "fulfilled"
        ? (lastEdit["data"] as string)
        : null,
    fetchError: collectionsResult.error
      ? rtkErrorToFetchError(collectionsResult.error)
      : null,
    formError:
      lastEdit?.["status"] === "rejected"
        ? rtkErrorToFetchError(lastEdit["error"])
        : null,
    isFetching: isResultFetching(collectionsResult),
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  const csrfToken: string = ownProps.csrfToken;
  return {
    fetchData: () =>
      dispatch(
        configServicesApi.endpoints.getCollections.initiate(undefined, {
          forceRefetch: true,
        })
      ),
    editItem: (data: FormData) =>
      dispatch(
        configServicesApi.endpoints.editCollection.initiate({ data, csrfToken })
      ),
    deleteItem: (identifier: string | number) =>
      dispatch(
        configServicesApi.endpoints.deleteCollection.initiate({
          identifier,
          csrfToken,
        })
      ),
    importCollection: (collectionId: string | number, force: boolean) =>
      dispatch(
        configServicesApi.endpoints.importCollection.initiate({
          collectionId,
          force,
          csrfToken,
        })
      ),
  };
}

const ConnectedCollections = connect<
  EditableConfigListStateProps<CollectionsData>,
  EditableConfigListDispatchProps<CollectionsData> &
    Pick<CollectionsDispatchProps, "importCollection">,
  EditableConfigListOwnProps
>(
  mapStateToProps,
  mapDispatchToProps
)(Collections);

export default ConnectedCollections;
