import * as React from "react";
import { Store } from "redux";
import { FetchErrorData } from "opds-web-client/lib/interfaces";
import { SettingData } from "../interfaces";
import { Alert } from "react-bootstrap";
import { State } from "../reducers/index";
import { Button } from "library-simplified-reusable-components";
import LoadingIndicator from "opds-web-client/lib/components/LoadingIndicator";
import ErrorMessage from "./ErrorMessage";
import PencilIcon from "./icons/PencilIcon";
import TrashIcon from "./icons/TrashIcon";

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
  store?: Store<State>;
  csrfToken: string;
  editOrCreate?: string;
  identifier?: string;
  settingUp?: boolean;
}

export interface EditableConfigListProps<T> extends EditableConfigListStateProps<T>, EditableConfigListDispatchProps<T>, EditableConfigListOwnProps {}

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
}

export interface AdditionalContentProps<T, U> {
  store?: Store<State>;
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

/** Shows a list of configuration services of a particular type and allows creating a new
    service or editing or deleting an existing services. Used for many of the tabs on the
    system configuration page.

    GenericEditableConfigList allows subclasses to define additional props. Subclasses of
    EditableConfigList cannot change the props and do not have to specify a type for them. */
export abstract class GenericEditableConfigList<T, U, V extends EditableConfigListProps<T>> extends React.Component<V, {}> {
  abstract EditForm: new(props: EditFormProps<T, U>) => React.Component<EditFormProps<T, U>, any>;
  abstract listDataKey: string;
  abstract itemTypeName: string;
  abstract urlBase: string;
  abstract identifierKey: string;
  abstract labelKey: string;
  limitOne = false;
  links?: {[key: string]: JSX.Element};
  AdditionalContent?: new(props: AdditionalContentProps<T, U>) => React.Component<AdditionalContentProps<T, U>, any>;
  ExtraFormSection?: new(props: ExtraFormSectionProps<T, U>) => React.Component<ExtraFormSectionProps<T, U>, any>;
  extraFormKey?: string;
  private editFormRef = React.createRef<any>();

  constructor(props) {
    super(props);
    this.editItem = this.editItem.bind(this);
    this.save = this.save.bind(this);
    this.label = this.label.bind(this);
    this.renderLi = this.renderLi.bind(this);
  }

  componentWillMount() {
    if (this.props.fetchData) {
      this.props.fetchData();
    }
  }

  render(): JSX.Element {
    const headers = this.getHeaders();
    // If not in edit or create mode and there is data, display the list.
    const canListAllData = !this.props.isFetching && !this.props.editOrCreate &&
      this.props.data && this.props.data[this.listDataKey];
    let EditForm = this.EditForm;
    let ExtraFormSection = this.ExtraFormSection;
    let itemToEdit = this.itemToEdit();
    return (
      <div className={this.getClassName()}>
        <h2>{headers["h2"]}</h2>
        { canListAllData && this.links && this.links["info"] &&
          <Alert bsStyle="info">{this.links["info"]}</Alert>
        }
        { this.props.responseBody && this.props.editOrCreate &&
          <Alert bsStyle="success">
            {this.successMessage()}
          </Alert>
        }
        { this.props.fetchError && !this.props.editOrCreate &&
          <ErrorMessage error={this.props.fetchError} />
        }
        { this.props.formError && this.props.editOrCreate &&
          <ErrorMessage error={this.props.formError} />
        }
        { this.props.isFetching &&
          <LoadingIndicator />
        }
        { canListAllData &&
          <div>
            { (!this.limitOne || this.props.data[this.listDataKey].length === 0) &&
              this.canCreate() &&
                <a
                  className="btn btn-default create-item"
                  href={this.urlBase + "create"}
                  >Create new {this.itemTypeName}
                </a>
            }
            <ul>
              { this.props.data[this.listDataKey].map((item, index) =>
                  this.renderLi(item, index))
              }
            </ul>
          </div>
        }
        { (this.props.editOrCreate === "create") &&
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
            />
          </div>
        }

        { itemToEdit &&
          <div>
            <h3>Edit {this.label(itemToEdit)}</h3>
            <EditForm
              item={itemToEdit}
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
            />
          </div>
        }
        { this.links && this.links["footer"] && <p>{this.links["footer"]}</p> }
      </div>
    );
  }

  renderLi(item, index): JSX.Element {
    let AdditionalContent = this.AdditionalContent || null;
    return (
      <li key={index}>
        <a
          className="btn small edit-item"
          href={this.urlBase + "edit/" + item[this.identifierKey]}
        >
          <span>
            Edit
            <PencilIcon />
          </span>
        </a>

        <h3>{this.label(item)}</h3>

        {this.canDelete() &&
          <Button
            className="danger delete-item small"
            callback={() => this.delete(item) }
            content={<span>Delete<TrashIcon /></span>}
          />
        }
        {
          AdditionalContent &&
          <AdditionalContent
            type={this.itemTypeName}
            item={item}
            store={this.props.store}
            csrfToken={this.props.csrfToken}
          />
        }
      </li>
    );
  }

  label(item): string {
    return item[this.labelKey];
  }

  getHeaders() {
    let h2 = `${this.getItemType()} configuration`;
    let h3 = `Create a new ${this.itemTypeName}`;
    return { h2, h3 };
  }

  getClassName() {
    let className = this.AdditionalContent ? "has-additional-content" : "";
    return className;
  }

  getItemType() {
    return this.itemTypeName.slice(0, 1).toUpperCase() + this.itemTypeName.slice(1);
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
        <span>{verb}
          <a href={this.getLink()}>a new {this.formatItemType()}</a>
        </span>
      );
    } else {
      verb = "Successfully edited this ";
      return (
        <span>{verb}{this.formatItemType()}</span>
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
   * true but the logic can be overridden by other classes
   * that inherit GenericEditableConfigList.
   */
  canDelete() {
    return true;
  }

  save(data: FormData) {
    this.editItem(data).then(() => {
      if (this.limitOne && this.props.editOrCreate === "create") {
        // Wait for two seconds so that the user can see the success message,
        // then go to the edit page
        setTimeout(() => {
          window.location.href = `${this.urlBase}edit/${this.props.responseBody}`;
        }, 2000);
      }
    });
  }

  async editItem(data: FormData): Promise<void> {
    // Scrolling to the top lets the user see the success or error message
    window.scrollTo(0, 0);
    await this.props.editItem(data);
    this.props.fetchData();
  }

  itemToEdit(): U | null {
    if (this.props.editOrCreate === "edit" && this.props.data && this.props.data[this.listDataKey]) {
      for (const item of this.props.data[this.listDataKey]) {
        if (String(item[this.identifierKey]) === this.props.identifier) {
          return item;
        }
      }
    }
    return null;
  }

  async delete(item: U): Promise<void> {
    if (window.confirm("Delete \"" + this.label(item) + "\"?")) {
      await this.props.deleteItem(item[this.identifierKey]);
      this.props.fetchData();
    }
  }
}

export abstract class EditableConfigList<T, U> extends GenericEditableConfigList<T, U, EditableConfigListProps<T>> {}

export default EditableConfigList;
