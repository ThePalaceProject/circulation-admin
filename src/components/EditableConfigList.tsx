import * as React from "react";
import { Store } from "@reduxjs/toolkit";
import { FetchErrorData } from "@thepalaceproject/web-opds-client/lib/interfaces";
import { LibraryData, SettingData } from "../interfaces";
import { Alert } from "react-bootstrap";
import { RootState } from "../store";
import { Button } from "library-simplified-reusable-components";
import LoadingIndicator from "@thepalaceproject/web-opds-client/lib/components/LoadingIndicator";
import ErrorMessage from "./ErrorMessage";
import PencilIcon from "./icons/PencilIcon";
import TrashIcon from "./icons/TrashIcon";
import VisibleIcon from "./icons/VisibleIcon";
import DisclosureIcon from "./icons/DisclosureIcon";
import Admin from "../models/Admin";
import * as PropTypes from "prop-types";

export interface EditableConfigListStateProps<T> {
  data?: T;
  fetchError?: FetchErrorData;
  formError?: FetchErrorData;
  isFetching?: boolean;
  responseBody?: string;
  additionalData?: any;
}

export interface EditableConfigListDispatchProps<T> {
  fetchData?: () => Promise<T>;
  editItem?: (data: FormData) => Promise<void>;
  deleteItem?: (identifier: string | number) => Promise<void>;
}

export interface EditableConfigListOwnProps {
  store?: Store<RootState>;
  csrfToken: string;
  editOrCreate?: string;
  identifier?: string;
  settingUp?: boolean;
}

export interface EditableConfigListProps<T>
  extends EditableConfigListStateProps<T>,
    EditableConfigListDispatchProps<T>,
    EditableConfigListOwnProps {}

export interface EditFormProps<T, U> {
  item?: U;
  data: T;
  additionalData?: any;
  extraFormSection?: any;
  extraFormKey?: string;
  disabled: boolean;
  save?: (data: FormData) => void;
  urlBase: string;
  listDataKey: string;
  responseBody?: string;
  error?: FetchErrorData;
  adminLevel?: number;
}

export interface AdditionalContentProps<T, U> {
  store?: Store<RootState>;
  csrfToken?: string;
  item?: U;
  type?: string;
}

export interface ExtraFormSectionProps<T, U> {
  setting: SettingData;
  disabled?: boolean;
  error?: FetchErrorData;
  currentValue?: string;
}

/** A single entry in the associated-items disclosure panel. */
export interface AssociatedEntry {
  label: string;
  suffix?: string;
  href?: string;
  pinned?: boolean;
}

/** Shows a list of configuration services of a particular type and allows creating a new
    service or editing or deleting an existing services. Used for many of the tabs on the
    system configuration page.

    GenericEditableConfigList allows subclasses to define additional props. Subclasses of
    EditableConfigList cannot change the props and do not have to specify a type for them. */
interface EditableConfigListState {
  expandedItems: Record<string, boolean>;
}

export abstract class GenericEditableConfigList<
  T,
  U,
  V extends EditableConfigListProps<T>
> extends React.Component<V, EditableConfigListState> {
  context: { admin: Admin };
  static contextTypes = {
    admin: PropTypes.object.isRequired,
  };
  abstract EditForm: new (props: EditFormProps<T, U>) => React.Component<
    EditFormProps<T, U>,
    any
  >;
  abstract listDataKey: string;
  abstract itemTypeName: string;
  abstract urlBase: string;
  abstract identifierKey: string;
  abstract labelKey: string;
  adminLevel?: number;
  limitOne = false;
  links?: { [key: string]: JSX.Element };
  AdditionalContent?: new (
    props: AdditionalContentProps<T, U>
  ) => React.Component<AdditionalContentProps<T, U>, any>;
  ExtraFormSection?: new (
    props: ExtraFormSectionProps<T, U>
  ) => React.Component<ExtraFormSectionProps<T, U>, any>;
  extraFormKey?: string;
  private editFormRef = React.createRef<any>();

  state: EditableConfigListState = {
    expandedItems: {},
  };

  constructor(props) {
    super(props);
    this.editItem = this.editItem.bind(this);
    this.save = this.save.bind(this);
    this.label = this.label.bind(this);
    this.renderLi = this.renderLi.bind(this);
    this.toggleAssociations = this.toggleAssociations.bind(this);
    this.toggleAllAssociations = this.toggleAllAssociations.bind(this);
    this.expandAll = this.expandAll.bind(this);
    this.collapseAll = this.collapseAll.bind(this);
  }

  componentDidMount() {
    const { fetchData, isFetching } = this.props;

    if (fetchData && !isFetching) {
      fetchData();
    }
  }

  render(): JSX.Element {
    const headers = this.getHeaders();
    // If not in edit or create mode and there is data, display the list.
    const canListAllData =
      !this.props.isFetching &&
      !this.props.editOrCreate &&
      this.props.data &&
      this.props.data[this.listDataKey];
    const EditForm = this.EditForm;
    const ExtraFormSection = this.ExtraFormSection;
    const itemToEdit = this.itemToEdit();
    const canEditItem = itemToEdit && this.canEdit(itemToEdit);
    const itemsWithEntries: Array<[
      U,
      AssociatedEntry[] | undefined
    ]> = this.getItems().map((item) => [item, this.getAssociatedEntries(item)]);
    const expandable: U[] = itemsWithEntries
      .filter((pair): pair is [U, AssociatedEntry[]] => {
        const [, e] = pair;
        return e != null && e.length > 0;
      })
      .map(([item]) => item);
    return (
      <div className={this.getClassName()}>
        <h2>{headers["h2"]}</h2>
        {canListAllData && this.links && this.links["info"] && (
          <Alert bsStyle="info">{this.links["info"]}</Alert>
        )}
        {this.props.responseBody && this.props.editOrCreate && (
          <Alert bsStyle="success">{this.successMessage()}</Alert>
        )}
        {this.props.fetchError && !this.props.editOrCreate && (
          <ErrorMessage error={this.props.fetchError} />
        )}
        {this.props.formError && this.props.editOrCreate && (
          <ErrorMessage error={this.props.formError} />
        )}
        {this.props.isFetching && <LoadingIndicator />}
        {canListAllData && (
          <div className="list-container">
            <header>
              {(!this.limitOne ||
                this.props.data[this.listDataKey].length === 0) &&
                this.canCreate() && (
                  <a
                    className="btn btn-default create-item"
                    href={this.urlBase + "create"}
                  >
                    Create new {this.itemTypeName}
                  </a>
                )}
              <div>{this.props.data[this.listDataKey].length} configured</div>
            </header>
            {this.renderExpandCollapseControls(expandable)}
            <ul>
              {itemsWithEntries.map(([item, entries]) =>
                this.renderLi(item, entries)
              )}
            </ul>
            {/* aria-hidden: the bottom controls are a visual convenience
                duplicate of the controls above the list. Screen readers and
                keyboard users should interact with the first set only. */}
            <div aria-hidden="true">
              {this.renderExpandCollapseControls(expandable)}
            </div>
          </div>
        )}
        {this.props.editOrCreate === "create" && (
          <div>
            <h3>{headers["h3"]}</h3>
            <EditForm
              ref={this.editFormRef}
              data={this.props.data}
              additionalData={this.props.additionalData}
              disabled={this.props.isFetching}
              save={this.save}
              urlBase={this.urlBase}
              listDataKey={this.listDataKey}
              responseBody={this.props.responseBody}
              error={this.props.formError}
              extraFormSection={ExtraFormSection}
              extraFormKey={this.extraFormKey}
              adminLevel={this.getAdminLevel()}
            />
          </div>
        )}

        {itemToEdit && (
          <div>
            <h3>
              {canEditItem ? "Edit " : ""}
              {this.label(itemToEdit)}
            </h3>
            <EditForm
              item={itemToEdit}
              data={this.props.data}
              additionalData={this.props.additionalData}
              disabled={!canEditItem || this.props.isFetching}
              save={canEditItem ? this.save : undefined}
              urlBase={this.urlBase}
              listDataKey={this.listDataKey}
              responseBody={this.props.responseBody}
              error={this.props.formError}
              extraFormSection={ExtraFormSection}
              extraFormKey={this.extraFormKey}
              adminLevel={this.getAdminLevel()}
            />
          </div>
        )}
        {this.links && this.links["footer"] && <p>{this.links["footer"]}</p>}
      </div>
    );
  }

  /**
   * Returns the raw list of items from the current data, or `[]` when data
   * has not yet loaded.  Centralises the `any` cast required because `T` is
   * not constrained to include `listDataKey`.
   */
  protected getItems(): U[] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.props.data as any)?.[this.listDataKey] ?? [];
  }

  /**
   * Returns the full list of libraries known to the server, used to resolve
   * short names to display names and UUIDs for the associated-items panel.
   *
   * The base implementation accesses `data.allLibraries` via an `any` cast
   * because the generic `T` is not constrained to include that field (e.g.
   * `LibrariesData` does not have it). Subclasses whose data type declares
   * `allLibraries` (e.g. `Collections`, `IndividualAdmins`) should override
   * this method with a type-safe accessor to avoid the cast.
   */
  protected getAllLibraries(): LibraryData[] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.props.data as any)?.allLibraries ?? [];
  }

  /**
   * Returns a human-readable summary of the association count shown next to
   * the item label (e.g. "3 libraries", "no libraries").  Override in
   * subclasses that use different terminology (e.g. "registered libraries",
   * "roles").
   */
  protected formatAssociatedCount(count: number): string {
    return count === 0
      ? "no libraries"
      : count === 1
      ? "1 library"
      : `${count} libraries`;
  }

  /**
   * Returns the list of display entries to show in the associated-items panel
   * for a given item, or `undefined` if the panel does not apply to this item.
   *
   * Return semantics (used by `renderLi` to drive toggle visibility):
   * - `undefined`  → the feature does not apply; no toggle is rendered.
   * - `[]`         → the feature applies but there are no associations;
   *                  a disabled toggle is rendered.
   * - `[…entries]` → associations exist; an enabled toggle is rendered.
   *
   * The base implementation reads the item's `libraries` field (an array of
   * `{ short_name }` objects) and resolves each entry against `getAllLibraries`.
   * Subclasses may override to supply different data sources or terminology
   * (see `DiscoveryServices.getAssociatedEntries`,
   * `IndividualAdmins.getAssociatedEntries`).
   *
   * Subclasses that do not support the feature should *not* override this
   * method; simply ensure that the item type has no `libraries` field so the
   * base implementation returns `undefined` for every item (see `Libraries`).
   */
  protected getAssociatedEntries(item: U): AssociatedEntry[] | undefined {
    const libraries: Array<{ short_name: string }> | undefined =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (item as any)?.libraries;
    if (libraries === undefined) return undefined;
    const allLibraries = this.getAllLibraries();
    return libraries.map((lib) => {
      const libraryData = allLibraries.find(
        (l) => l.short_name === lib.short_name
      );
      return {
        label: libraryData?.name || lib.short_name,
        href: libraryData?.uuid
          ? `/admin/web/config/libraries/edit/${libraryData.uuid}`
          : undefined,
      };
    });
  }

  /**
   * Renders the expanded associated-items `<ul>`.  Pinned entries (e.g.
   * sitewide roles) are sorted before per-item entries; within each group
   * entries are sorted alphabetically by label.
   */
  protected renderAssociatedSection(entries: AssociatedEntry[]): JSX.Element {
    const sorted = [...entries].sort((a, b) => {
      // Pinned entries (e.g. sitewide roles) always appear before per-item entries.
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return a.label.localeCompare(b.label);
    });
    return (
      <ul className="associated-items">
        {sorted.map((entry, i) => (
          <li key={entry.href ?? `${entry.label}-${i}`}>
            {entry.href ? <a href={entry.href}>{entry.label}</a> : entry.label}
            {entry.suffix}
          </li>
        ))}
      </ul>
    );
  }

  renderLi(
    item: U,
    precomputedEntries: AssociatedEntry[] | undefined | null = null
  ): JSX.Element {
    const AdditionalContent = this.AdditionalContent || null;
    const associatedEntries =
      precomputedEntries !== null
        ? precomputedEntries
        : this.getAssociatedEntries(item);
    const libraryCount =
      associatedEntries != null ? associatedEntries.length : null;
    const itemKey = String(item[this.identifierKey]);
    const isExpanded =
      libraryCount !== null &&
      libraryCount > 0 &&
      !!this.state.expandedItems[itemKey];

    return (
      <li key={itemKey}>
        <div className="item-header">
          <div className="item-label">
            {libraryCount !== null && (
              <button
                className="association-toggle"
                onClick={(e) =>
                  e.altKey
                    ? this.toggleAllAssociations()
                    : this.toggleAssociations(itemKey)
                }
                {...(libraryCount > 0 ? { "aria-expanded": isExpanded } : {})}
                aria-label={`${
                  isExpanded ? "Collapse" : "Expand"
                } associations for ${this.label(item)} (Alt+Click to ${
                  isExpanded ? "collapse" : "expand"
                } all)`}
                title={`${
                  isExpanded ? "Collapse" : "Expand"
                } associations for ${this.label(item)} (Alt+Click to ${
                  isExpanded ? "collapse" : "expand"
                } all)`}
                disabled={libraryCount === 0}
              >
                <DisclosureIcon expanded={isExpanded} />
              </button>
            )}
            <h3>
              {this.label(item)}
              {libraryCount !== null && (
                <span className="library-count">
                  {" "}
                  ({this.formatAssociatedCount(libraryCount)})
                </span>
              )}
            </h3>
          </div>

          <a
            className="btn small edit-item"
            href={this.urlBase + "edit/" + item[this.identifierKey]}
          >
            {this.canEdit(item) ? (
              <span>
                Edit <PencilIcon />
              </span>
            ) : (
              <span>
                View <VisibleIcon />
              </span>
            )}
          </a>

          {this.canDelete() && (
            <Button
              className="danger delete-item small"
              callback={() => this.delete(item)}
              content={
                <span>
                  Delete
                  <TrashIcon />
                </span>
              }
            />
          )}
        </div>
        {isExpanded && this.renderAssociatedSection(associatedEntries)}
        {AdditionalContent && (
          <AdditionalContent
            type={this.itemTypeName}
            item={item}
            store={this.props.store}
            csrfToken={this.props.csrfToken}
          />
        )}
      </li>
    );
  }

  toggleAssociations(itemKey: string): void {
    this.setState((prev) => ({
      expandedItems: {
        ...prev.expandedItems,
        [itemKey]: !prev.expandedItems[itemKey],
      },
    }));
  }

  expandAll(): void {
    const newExpandedItems: Record<string, boolean> = {};
    for (const item of this.getExpandableItems()) {
      newExpandedItems[String(item[this.identifierKey])] = true;
    }
    this.setState({ expandedItems: newExpandedItems });
  }

  collapseAll(): void {
    this.setState({ expandedItems: {} });
  }

  toggleAllAssociations(): void {
    const expandable = this.getExpandableItems();
    if (expandable.length === 0) return;
    const anyCollapsed = expandable.some(
      (item) => !this.state.expandedItems[String(item[this.identifierKey])]
    );
    if (anyCollapsed) {
      const expandedItems: Record<string, boolean> = {};
      for (const item of expandable) {
        expandedItems[String(item[this.identifierKey])] = true;
      }
      this.setState({ expandedItems });
    } else {
      this.collapseAll();
    }
  }

  /** Returns items that have at least one associated entry (i.e. are expandable). */
  private getExpandableItems(): U[] {
    return this.getItems().filter((item) => {
      const entries = this.getAssociatedEntries(item);
      return entries != null && entries.length > 0;
    });
  }

  private renderExpandCollapseControls(expandable: U[]): JSX.Element | null {
    if (expandable.length === 0) return null;
    const allExpanded = expandable.every(
      (item) => !!this.state.expandedItems[String(item[this.identifierKey])]
    );
    const noneExpanded = expandable.every(
      (item) => !this.state.expandedItems[String(item[this.identifierKey])]
    );
    return (
      <div className="expand-collapse-controls">
        <button
          className="expand-all"
          onClick={this.expandAll}
          disabled={allExpanded}
        >
          Expand all
        </button>
        <button
          className="collapse-all"
          onClick={this.collapseAll}
          disabled={noneExpanded}
        >
          Collapse all
        </button>
      </div>
    );
  }

  label(item): string {
    return item[this.labelKey];
  }

  getAdminLevel() {
    let level;
    if (this.context.admin?.isSystemAdmin()) {
      level = 3;
    } else if (this.context.admin?.isLibraryManagerOfSomeLibrary()) {
      level = 2;
    } else {
      level = 1;
    }
    return level;
  }

  getHeaders() {
    const h2 = `${this.getItemType()} configuration`;
    const h3 = `Create a new ${this.itemTypeName}`;
    return { h2, h3 };
  }

  getClassName(): string {
    const className = this.AdditionalContent ? "has-additional-content" : "";
    return className;
  }

  getItemType() {
    return (
      this.itemTypeName.slice(0, 1).toUpperCase() + this.itemTypeName.slice(1)
    );
  }

  formatItemType() {
    const itemType = this.getItemType();
    const regexp = /^[A-Z]*$/;
    // If the item's name started out in all caps--e.g. "CDN"--don't lowercase it.
    const isAllCaps = regexp.test(itemType.split(" service")[0]);
    const formattedItemType = isAllCaps ? itemType : itemType.toLowerCase();
    return formattedItemType;
  }

  successMessage() {
    let verb;
    if (this.props.editOrCreate === "create") {
      verb = "Successfully created ";
      return (
        <span>
          {verb}
          <a href={this.getLink()}>a new {this.formatItemType()}</a>
        </span>
      );
    } else {
      verb = "Successfully edited this ";
      return (
        <span>
          {verb}
          {this.formatItemType()}
        </span>
      );
    }
  }

  getLink() {
    return `${this.urlBase}edit/${this.props.responseBody}`;
  }

  /**
   * canCreate
   * Does this service have the ability to create a new item? The default is
   * true but the logic can be overridden by other classes
   * that inherit GenericEditableConfigList. For example, a class would only
   * want to create a new item if the admin is a system admin.
   */
  canCreate() {
    return true;
  }

  /**
   * canDelete
   * Does this service have the ability to delete an item? The default is
   * true, as long as the user is a system admin, but the logic can be overridden by other classes
   * that inherit GenericEditableConfigList.
   */
  canDelete() {
    return this.getAdminLevel() === 3;
  }

  canEdit(item) {
    // The server has the option to assign the item a level from 1 to 3, indicating what level of permissions
    // the admin needs to have in order to be able to modify the item.
    // (Currently, this is just being used to prevent librarians from modifying local analytics configurations.)
    return !item.level || item.level <= this.getAdminLevel();
  }

  save(data: FormData) {
    this.editItem(data)
      .then(() => {
        if (this.limitOne && this.props.editOrCreate === "create") {
          // Wait for two seconds so that the user can see the success message,
          // then go to the edit page
          setTimeout(() => {
            window.location.href = `${this.urlBase}edit/${this.props.responseBody}`;
          }, 2000);
        }
      })
      .catch(() => {
        // Error already surfaced via the Redux formError prop; suppress the
        // unhandled-rejection warning.
      });
  }

  async editItem(data: FormData): Promise<void> {
    // Scrolling to the top lets the user see the success or error message
    window.scrollTo(0, 0);
    await this.props.editItem(data);
    this.props.fetchData();
  }

  itemToEdit(): U | null {
    if (
      this.props.editOrCreate === "edit" &&
      this.props.data &&
      this.props.data[this.listDataKey]
    ) {
      for (const item of this.props.data[this.listDataKey]) {
        if (String(item[this.identifierKey]) === this.props.identifier) {
          return item;
        }
      }
    }
    return null;
  }

  async delete(item: U): Promise<void> {
    if (window.confirm(`Delete "` + this.label(item) + `"?`)) {
      await this.props.deleteItem(item[this.identifierKey]);
      this.props.fetchData();
    }
  }
}

export abstract class EditableConfigList<
  T,
  U
> extends GenericEditableConfigList<T, U, EditableConfigListProps<T>> {}

export default EditableConfigList;
