import * as React from "react";
import { Store } from "redux";
import { FetchErrorData } from "opds-web-client/lib/interfaces";
import { Alert } from "react-bootstrap";
import { State } from "../reducers/index";
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
}

/** Shows a list of configuration services of a particular type and allows creating a new
    service or editing or deleting an existing services. Used for many of the tabs on the
    system configuration page.

    GenericEditableConfigList allows subclasses to define additional props. Subclasses of
    EditableConfigList cannot change the props and do not have to specify a type for them. */
export abstract class GenericEditableConfigList<T, U, V extends EditableConfigListProps<T>> extends React.Component<V, void> {
  abstract EditForm: new(props: EditFormProps<T, U>) => React.Component<EditFormProps<T, U>, any>;
  abstract listDataKey: string;
  abstract itemTypeName: string;
  abstract urlBase: string;
  abstract identifierKey: string;
  abstract labelKey: string;
  limitOne = false;
  AdditionalContent?: new(props: AdditionalContentProps<T, U>) => React.Component<AdditionalContentProps<T, U>, any>;

  constructor(props) {
    super(props);
    this.editItem = this.editItem.bind(this);
    this.save = this.save.bind(this);
    this.label = this.label.bind(this);
  }

  render(): JSX.Element {
    let EditForm = this.EditForm;
    let AdditionalContent = this.AdditionalContent || null;
    let headers = this.getHeaders();

    return (
      <div className={this.getClassName()}>
        <h2>{headers["h2"]}</h2>
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
        { !this.props.isFetching && !this.props.editOrCreate && this.props.data && this.props.data[this.listDataKey] &&
          <div>
            { (!this.limitOne || this.props.data[this.listDataKey].length === 0) && this.canCreate() &&
              <a
                className="btn btn-default create-item"
                href={this.urlBase + "create"}
                >Create new {this.itemTypeName}</a>
            }
            <ul>
              { this.props.data[this.listDataKey].map((item, index) =>
                  <li key={index}>
                    <a
                      className="btn btn-default edit-item"
                      href={this.urlBase + "edit/" + item[this.identifierKey]}
                    >
                      <span>
                        Edit
                        <PencilIcon />
                      </span>
                    </a>
                    <h4>
                      {this.label(item)}
                    </h4>
                    { this.canDelete(item) &&
                      <button
                        className="btn btn-danger delete-item"
                        onClick={() => this.delete(item) }
                      >
                        <span>
                          Delete
                          <TrashIcon />
                        </span>
                      </button>
                    }
                    {
                      AdditionalContent &&
                      <AdditionalContent
                        item={item}
                        store={this.props.store}
                        csrfToken={this.props.csrfToken}
                      />
                    }
                  </li>
                )
              }
            </ul>
          </div>
        }
        { (this.props.editOrCreate === "create") &&
          <div>
            <h3>{headers["h3"]}</h3>
            <EditForm
              ref="edit-form"
              data={this.props.data}
              disabled={this.props.isFetching}
              save={this.save}
              urlBase={this.urlBase}
              listDataKey={this.listDataKey}
              responseBody={this.props.responseBody}
              error={this.props.formError}
              />
          </div>
        }

        { this.itemToEdit() &&
          <div>
            <h3>Edit {this.label(this.itemToEdit())}</h3>
            <EditForm
              item={this.itemToEdit()}
              data={this.props.data}
              disabled={this.props.isFetching}
              save={this.save}
              urlBase={this.urlBase}
              listDataKey={this.listDataKey}
              responseBody={this.props.responseBody}
              error={this.props.formError}
              />
          </div>
        }
      </div>
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
    }
    else {
      verb = "Successfully edited this ";
      return (
        <span>{verb}{this.formatItemType()}</span>
      );
    }
  }

  getLink() {
    return this.urlBase + "edit/" + this.props.responseBody;
  }

  canCreate() {
    return true;
  }

  canDelete(item) {
    return true;
  }

  componentWillMount() {
    if (this.props.fetchData) {
      this.props.fetchData();
    }
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
